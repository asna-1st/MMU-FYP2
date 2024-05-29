<script>
	import { onDestroy, onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import axiosInstance from '../../../../../../lib/scripts/axiosInstance.js';
	import utils from '../../../../../../lib/scripts/utils.js';

	export let data;

	let token;
	const scheduleID = data.scheduleID;
	let currentPage = 0;
	let eventDays = writable([]);
	let attendance = writable([]);

	onMount(async () => {
		token = utils.getToken();
		const response = await axiosInstance.post(
			'/schedule/event',
			{ scheduleID },
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		);

		const event = response.data.event;
		let days = [];
		let currentDate = new Date(event.StartDate);
		while (currentDate <= new Date(event.EndDate)) {
			days.push(new Date(currentDate));
			currentDate.setDate(currentDate.getDate() + 1);
		}
		eventDays.set(days);
		loadAttendance(days[0]);
	});

	async function loadAttendance(date) {
		const response = await axiosInstance.post(
			'/attendance/manual',
			{ scheduleID, date: date.toISOString() },
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		);

		attendance.set(response.data);
		console.log(response.data);
	}

	function getButtonText(volunteer) {
		if (!volunteer.Attendance.length) {
			return 'Check-in';
		} else if (volunteer.Attendance[0].CheckIn && !volunteer.Attendance[0].CheckOut) {
			return 'Check-out';
		} else {
			return 'Checked In/Out';
		}
	}

	function attendanceButtonClass(volunteer) {
		if (!volunteer.Attendance.length) {
			return 'attendance-button';
		} else if (volunteer.Attendance[0].CheckIn && !volunteer.Attendance[0].CheckOut) {
			return 'attendance-button checked-in';
		} else if (volunteer.Attendance[0].CheckOut) {
			return 'attendance-button checked-out';
		} else {
			return 'attendance-button';
		}
	}

	function isButtonDisabled(record) {
		return (
			record.Attendance.length && record.Attendance[0].CheckIn && record.Attendance[0].CheckOut
		);
	}

  async function toggleAttendance(volunteerID, date) {
    const formattedDate = date.toISOString().split('T')[0];
    const response = await axiosInstance.post(
			'/attendance/manual/toggle',
			{ scheduleID, volunteerID, date: formattedDate },
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		);
    loadAttendance(date);
  }

	$: if ($eventDays.length > 0) {
		loadAttendance($eventDays[currentPage]);
	}
</script>

<main class="container mx-auto p-4">
	<h1 class="text-2xl font-bold mb-4">Manual Volunteer Attendance</h1>
	<!-- <div class="overflow-x-auto"> -->
	<div>
		<button
			on:click={() => (currentPage = currentPage > 0 ? currentPage - 1 : 0)}
			disabled={currentPage === 0}>Previous</button
		>
		<button
			on:click={() =>
				(currentPage =
					currentPage < $eventDays.length - 1 ? currentPage + 1 : $eventDays.length - 1)}
			disabled={currentPage === $eventDays.length - 1}>Next</button
		>
		<p>Day: {$eventDays[currentPage] && new Date($eventDays[currentPage]).toDateString()}</p>
	</div>
	<div class="table-container pt-5">
		<table class="table table-hover">
			<thead>
				<tr>
					<th>Name</th>
					<th>Email</th>
					<th>Check-In Time</th>
					<th>Check-Out Time</th>
					<th>Action</th>
				</tr>
			</thead>
			<tbody>
				{#each $attendance as record}
					<tr>
						<td>{record.VolunteerID.Name}</td>
						<td>{record.VolunteerID.Email}</td>
						<td>
							{record.Attendance[0]?.CheckIn
								? new Date(record.Attendance[0].CheckIn).toLocaleTimeString()
								: 'N/A'}
						</td>
						<td>
							{record.Attendance[0]?.CheckOut
								? new Date(record.Attendance[0].CheckOut).toLocaleTimeString()
								: 'N/A'}
						</td>
						<td>
							<button
								class="btn {attendanceButtonClass(record)}"
								on:click={() => toggleAttendance(record.VolunteerID._id, $eventDays[currentPage])}
								disabled={isButtonDisabled(record)}
							>
								{getButtonText(record)}
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<!-- </div> -->
</main>

<style>
	.attendance-button {
		background-color: #4caf50;
		color: #fff;
	}

	.checked-in {
		background-color: #4caf50;
		color: #fff;
	}

	.checked-out {
		background-color: #f44336;
		color: #fff;
	}

	.disabled {
		background-color: #ccc;
		cursor: not-allowed;
	}
</style>
