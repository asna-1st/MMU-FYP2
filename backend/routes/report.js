const express = require('express');
const router = express.Router();
const jwtVerify = require('./middleware/jwtVerify');
const PDFDocument = require('pdfkit-table');
const puppeteer = require('puppeteer');
const fs = require('fs');

const volUser = require('./models/volunteerModel');
const eventDB = require('./models/eventModel');
const scheduleDB = require('./models/scheduleModel');
const volunteerScheduleDB = require('./models/volunteerScheduleModel');
const attendanceDB = require('./models/attendance');



router.get("/generate/:eventID", jwtVerify([0]), async (req, res) => {
    try {
        const eventID = req.params.eventID;
        const event = await eventDB.findById(eventID);
        const schedules = await scheduleDB.find({ EventID: eventID });

        const doc = new PDFDocument();
        const filename = `Event_Report_${eventID}.pdf`;
        const stream = doc.pipe(fs.createWriteStream(filename));

        doc.fontSize(16).text('Event Information', { align: 'center' });
        doc.fontSize(12).text(`Name: ${event.Name}`);
        doc.text(`Start Date: ${event.StartDate}`);
        doc.text(`End Date: ${event.EndDate}`);
        doc.text(`Description: ${event.Description}`);
        doc.text(`Address: ${event.Address}`);
        doc.text(`Country: ${event.Country}`);
        doc.moveDown();

        for (const schedule of schedules) {
            doc.addPage();
            doc.fontSize(16).text('Schedule Information', { align: 'center' });
            doc.fontSize(12).text(`Name: ${schedule.Name}`);
            doc.text(`Begin At: ${schedule.BeginAt}`);
            doc.text(`End At: ${schedule.EndAt}`);
            doc.text(`Description: ${schedule.Description}`);
            doc.text(`Max Volunteers: ${schedule.MaxVolunteer}`);
            doc.moveDown();

            const volunteerSchedule = await volunteerScheduleDB.find({ ScheduleID: schedule._id });
            const volunteerIDs = await volunteerSchedule.map(vs => vs.VolunteerID);
            const volunteers = await volUser.find({ _id: { $in: volunteerIDs } });

            if (volunteers.length > 0) {
                /* const headers = ['Name', 'Email'];
                const headerY = doc.y;
                const headerXStart = 50;
                const cellPadding = 10;
                const rowHeight = 20;
                const colWidth = (doc.page.width - 100) / headers.length;

                // Draw table headers
                headers.forEach((header, i) => {
                    doc.text(header, headerXStart + i * colWidth, headerY);
                });

                let rowY = headerY + 30;
                volunteers.forEach((volunteer, index) => {
                    const rowData = [volunteer.Name, volunteer.Email];
                    rowData.forEach((cell, i) => {
                        doc.text(cell, headerXStart + i * colWidth, rowY + index * rowHeight, { width: colWidth - cellPadding });
                    });
                }) */
                const volunteerList = [];
                for (const volunteer of volunteers) {
                    volunteerList.push([volunteer.Name, volunteer.Email]);
                }
                const table = {
                    headers: ["Name", "Email"],
                    rows: volunteerList
                };

                doc.table(table, {
                    divider: {
                        vertical: { disabled: true, width: 0.5, opacity: 1 }
                    }
                });

            } else {
                doc.text('No volunteers joined this schedule.');
            }

            doc.moveDown();
        }

        doc.end();
        console.log(`PDF report generated: ${filename}`);

        stream.on('finish', () => {
            res.download(filename, (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                    res.status(500).json({ error: 'Internal Server Error' })
                } else {
                    fs.unlinkSync(filename);
                }
            });
        });
        //res.setHeader('Content-Type', 'application/pdf');
        //res.setHeader('Content-Disposition', `attachment; filename=Event_Report_${eventID}.pdf`);
        //res.send(filename);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.get("/generate/list/:eventID", jwtVerify([0]), async (req, res) => {
    try {
        const eventID = req.params.eventID;

        const volunteerSchedules = await volunteerScheduleDB.find({})
            .populate({
                path: 'ScheduleID',
                populate: {
                    path: 'EventID',
                    match: { _id: eventID }
                }
            })
            .populate('VolunteerID');

        const filteredVolunteerSchedules = volunteerSchedules.filter(schedule => schedule.ScheduleID && schedule.ScheduleID.EventID);

        if (filteredVolunteerSchedules.length === 0) {
            return res.status(404).json({ error: 'No volunteers found for this event' });
        }

        const event = await eventDB.findById(eventID).populate('OrganizationID');
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        let html = `
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                    }
                    table {
                        border-collapse: collapse;
                        width: 100%;
                    }
                    th, td {
                        border: 1px solid black;
                        padding: 8px;
                        text-align: left;
                    }
                </style>
            </head>
            <body>
                <h1>Event: ${event.Name}</h1>
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Name</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        filteredVolunteerSchedules.forEach((schedule, index) => {
            html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${schedule.VolunteerID.Name}</td>
                        <td>${schedule.VolunteerID.Email}</td>
                    </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
                <p>Total Volunteers: ${filteredVolunteerSchedules.length}</p>
            </body>
            </html>
        `;

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            timeout: 60000
        });
        const page = await browser.newPage();
        await page.setContent(html);
        const pdfBuffer = await page.pdf({ format: 'A4', landscape: false });

        await browser.close();

        console.log(`PDF report generated`);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=volunteer-list.pdf');

        //res.setHeader('Content-Type', 'application/pdf');
        //res.setHeader('Content-Disposition', `attachment; filename=Event_Report_${eventID}.pdf`);
        res.send(pdfBuffer);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

router.get("/generate/attendance/:eventID", jwtVerify([0]), async (req, res) => {
    try {
        const eventID = req.params.eventID;
        const event = await eventDB.findById(eventID);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const volunteerSchedules = await volunteerScheduleDB.find({})
            .populate({
                path: 'ScheduleID',
                populate: {
                    path: 'EventID',
                    match: { _id: eventID }
                }
            })
            .populate('VolunteerID');

        const filteredVolunteerSchedules = volunteerSchedules.filter(schedule => schedule.ScheduleID && schedule.ScheduleID.EventID);

        if (filteredVolunteerSchedules.length === 0) {
            return res.status(404).json({ error: 'No schedules found for this event' });
        }

        const attendanceRecords = await attendanceDB.find({
            VolunteerScheduleID: { $in: filteredVolunteerSchedules.map(schedule => schedule._id) }
        });

        const eventStartDate = new Date(event.StartDate);
        const eventEndDate = new Date(event.EndDate);
        const dates = [];
        for (let d = eventStartDate; d <= eventEndDate; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
        }

        const maxDatesPerTable = 10;

        let html = `
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                    }
                    table {
                        border-collapse: collapse;
                        width: 100%;
                        margin-bottom: 20px;
                        page-break-inside: avoid;
                    }
                    th, td {
                        border: 1px solid black;
                        padding: 8px;
                        text-align: left;
                        font-size: 12px;
                    }
                    .legend {
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <h1>Attendance List for Event: ${event.Name}</h1>
        `;

        const schedules = {};
        filteredVolunteerSchedules.forEach(schedule => {
            if (!schedules[schedule.ScheduleID._id]) {
                schedules[schedule.ScheduleID._id] = {
                    schedule: schedule.ScheduleID,
                    volunteers: []
                };
            }
            schedules[schedule.ScheduleID._id].volunteers.push(schedule);
        });

        Object.values(schedules).forEach((scheduleData, scheduleIndex) => {
            html += `<h2>Schedule: ${scheduleData.schedule.Name}</h2>`;
            const totalTables = Math.ceil(dates.length / maxDatesPerTable);

            for (let tableIndex = 0; tableIndex < totalTables; tableIndex++) {
                const start = tableIndex * maxDatesPerTable;
                const end = Math.min(start + maxDatesPerTable, dates.length);
                const dateSubset = dates.slice(start, end);

                html += `
                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Name</th>
                `;

                dateSubset.forEach(date => {
                    html += `<th style="text-align: center">${date.toISOString().split('T')[0]}</th>`;
                });

                html += `
                            </tr>
                        </thead>
                        <tbody>
                `;

                scheduleData.volunteers.forEach((schedule, volunteerIndex) => {
                    html += `
                        <tr>
                            <td>${volunteerIndex + 1}</td>
                            <td>${schedule.VolunteerID.Name}</td>
                    `;

                    dateSubset.forEach(date => {
                        const record = attendanceRecords.find(record => record.VolunteerScheduleID.equals(schedule._id) && record.Date.toISOString().split('T')[0] === date.toISOString().split('T')[0]);
                        let attendanceStatus;
                        if (record) {
                            if (record.CheckIn && record.CheckOut) {
                                attendanceStatus = '✔';
                            } else if (record.CheckIn || record.CheckOut) {
                                attendanceStatus = '-';
                            } else {
                                attendanceStatus = 'x';
                            }
                        } else {
                            attendanceStatus = 'x';
                        }
                        html += `<td style="text-align: center">${attendanceStatus}</td>`;
                    });

                    html += `
                        </tr>
                    `;
                });

                html += `
                        </tbody>
                    </table>
                `;
            }
        });

        html += `
            <div class="legend">
                <h2>Legend</h2>
                <p>✔ - Both Check-in and Check-out</p>
                <p>- - Either Check-in or Check-out</p>
                <p>x - No Check-in or Check-out</p>
            </div>
        `;

        html += `
            </body>
            </html>
            `;

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            timeout: 60000
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', landscape: true });

        await browser.close();

        // Set response headers to trigger file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=attendance-list.pdf');
        res.send(pdfBuffer);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});
module.exports = router;