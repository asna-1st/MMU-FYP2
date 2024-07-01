<script>
    import { getModalStore } from '@skeletonlabs/skeleton';
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import { DateTime } from 'luxon';
    import axiosInstance from '../../scripts/axiosInstance';

    export let parent;
    let dateMap = writable({});
    let error = writable(null);

    const modalStore = getModalStore();
    let token;

    onMount(async () => {
        token = getCookie('token');
        const volunteerScheduleId = $modalStore[0]?.meta?.volScheduleID;
        if (volunteerScheduleId) {
            try {
                const { StartDate, EndDate, attendances } = await getAttendanceStatus(volunteerScheduleId);
                const processedData = processAttendanceData(StartDate, EndDate, attendances);
                dateMap.set(processedData);
            } catch (err) {
                error.set(err);
            }
        }
    });

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    async function getAttendanceStatus(volunteerScheduleId) {
        try {
            const volunteerScheduleResponse = await axiosInstance.post(
                `/attendance/info`,
                { volScheduleID: volunteerScheduleId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const volunteerSchedule = volunteerScheduleResponse.data;

            const { ScheduleID } = volunteerSchedule;
            const { EventID } = ScheduleID;
            const { StartDate, EndDate } = EventID;

            const attendancesResponse = await axiosInstance.post(
                `/attendance/status/list`,
                { volScheduleID: volunteerScheduleId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            return { StartDate, EndDate, attendances: attendancesResponse.data };
        } catch (err) {
            console.error('Error fetching attendance status:', err);
            throw err;
        }
    }

    function processAttendanceData(startDate, endDate, attendances) {
        const dateMap = {};
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Initialize the map with event dates
        let currentDate = DateTime.fromISO(startDate).setZone(timeZone);
        const end = DateTime.fromISO(endDate).setZone(timeZone);

        while (currentDate <= end) {
            const dateString = currentDate.toISODate();
            dateMap[dateString] = { checkIn: null, checkOut: null };
            currentDate = currentDate.plus({ days: 1 });
        }

        // Populate the map with attendance data
        attendances.forEach((attendance) => {
            const date = DateTime.fromJSDate(new Date(attendance.Date)).setZone(timeZone).toISODate();
            if (dateMap[date]) {
                dateMap[date].checkIn = attendance.CheckIn;
                dateMap[date].checkOut = attendance.CheckOut;
            }
        });

        return dateMap;
    }

    const cBase = 'card p-4 w-modal shadow-xl space-y-4';
    const cHeader = 'text-2xl font-bold';
    const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';
</script>

{#if $modalStore[0]}
    <div class="modal-example-form {cBase}">
        <header class={cHeader}>{$modalStore[0].title ?? '(title missing)'}</header>
        <article>{$modalStore[0].body ?? '(body missing)'}</article>
        <div class={cForm}>
            <div class="table-container">
                <table class="table table-compact">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Check-In</th>
                            <th>Check-Out</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each Object.keys($dateMap) as date}
                            <tr>
                                <td>{date}</td>
                                <td>{$dateMap[date].checkIn ? DateTime.fromISO($dateMap[date].checkIn).toLocaleString(DateTime.TIME_SIMPLE) : 'No check-in'}</td>
                                <td>{$dateMap[date].checkOut ? DateTime.fromISO($dateMap[date].checkOut).toLocaleString(DateTime.TIME_SIMPLE) : 'No check-out'}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <footer class="modal-footer {parent.regionFooter}">
            <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
        </footer>
    </div>
{/if}

<style>
    .table-container {
        max-height: 300px; /* Adjust as needed */
        overflow-y: auto;
    }
</style>
