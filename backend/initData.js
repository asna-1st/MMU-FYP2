const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

const Event = require('./routes/models/eventModel')
const Organization = require('./routes/models/organizationModel')
const Schedule = require('./routes/models/scheduleModel')
const Volunteer = require('./routes/models/volunteerModel')
const VolunteerSchedule = require('./routes/models/volunteerScheduleModel');

async function createRandomEvent(organizationId) {
  const event = new Event({
    Name: faker.internet.userName,
    CreateAt: faker.date.past(),
    StartDate: faker.date.future(),
    EndDate: faker.date.future(),
    Description: faker.lorem.paragraph(),
    Address: faker.location.streetAddress(),
    Country: faker.location.country(),
    OrganizationID: organizationId,
  });

  await event.save();

  return event;
}

async function createRandomOrganization() {
  const organization = new Organization({
    Name: faker.company.name(),
    Email: faker.internet.email(),
    YearEstablished: faker.number.int({ min: 2000, max: 2023 }),
    Password: faker.internet.password(),
    Address: faker.location.streetAddress(),
    Country: faker.location.country(),
  });

  await organization.save();

  return organization;
}

async function createRandomSchedule(eventId) {
  const schedule = new Schedule({
    Name: faker.internet.userName(),
    BeginAt: faker.date.future(),
    EndAt: faker.date.future(),
    Description: faker.lorem.sentence(),
    MaxVolunteer: faker.number.int({ min: 5, max: 20 }),
    EventID: eventId,
  });

  await schedule.save();

  return schedule;
}

async function createRandomVolunteer() {
  const volunteer = new Volunteer({
    Name: faker.person.fullName(),
    Email: faker.internet.email(),
    YearEstablished: faker.number.int({ min: 1800, max: 2023 }),
    Password: faker.internet.password(),
    Address: faker.location.streetAddress(),
    Country: faker.location.country(),
  });

  await volunteer.save();

  return volunteer;
}

async function initializeData() {
  const organization = await createRandomOrganization();

  for (let i = 0; i < 3; i++) {
    const event = await createRandomEvent(organization._id);

    for (let j = 0; j < 5; j++) {
      const schedule = await createRandomSchedule(event._id);

      for (let k = 0; k < 10; k++) {
        const volunteer = await createRandomVolunteer();
        const volunteerSchedule = new VolunteerSchedule({
          ScheduleID: schedule._id,
          VolunteerID: volunteer._id,
        });

        await volunteerSchedule.save();
      }
    }
  }

  console.log('Data initialized successfully');
}

module.exports = initializeData;