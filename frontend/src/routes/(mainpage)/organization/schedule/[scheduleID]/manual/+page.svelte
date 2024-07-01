<script>
	import { onDestroy, onMount } from 'svelte';
	import { writable, derived } from 'svelte/store';
	import { fade, fly } from 'svelte/transition';
	import axiosInstance from '../../../../../../lib/scripts/axiosInstance.js';
	import utils from '../../../../../../lib/scripts/utils.js';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import LoadingScreen from '../../../../../../lib/component/LoadingScreen.svelte';
	import { DateTime } from 'luxon';

	export let data;

	let token;
	const scheduleID = data.scheduleID;
	let eventDays = writable([]);
	let attendance = writable([]);
	let currentPage = writable(0);
	let selectedDate = writable('');
	const searchQuery = writable('');
	const loading = writable(true);
	const recordsPerPage = 10;
	const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
		if (days.length > 0) {
			selectedDate.set(days[0].toISOString().split('T')[0]);
			loadAttendance(days[0]);
		}
		loading.set(false);
	});

	async function loadAttendance(date) {
		const response = await axiosInstance.post(
			'/attendance/manual',
			{ scheduleID, date: date.toISOString(), timeZone },
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		);

		attendance.set(response.data);
		//console.log(response.data);
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
			{ scheduleID, volunteerID, date: formattedDate, timeZone },
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		);
		loadAttendance(date);
	}

	$: if ($selectedDate) {
		loadAttendance(new Date($selectedDate));
	}

	$: totalPages = Math.ceil($filteredAttendance.length / recordsPerPage);
	$: paginatedAttendance = $filteredAttendance.slice(
		$currentPage * recordsPerPage,
		($currentPage + 1) * recordsPerPage
	);

	function nextPage() {
		if ($currentPage < totalPages - 1) {
			currentPage.update((n) => n + 1);
		}
	}

	function prevPage() {
		if ($currentPage > 0) {
			currentPage.update((n) => n - 1);
		}
	}

	const filteredAttendance = derived([attendance, searchQuery], ([$attendance, $searchQuery]) => {
		if (!$searchQuery) return $attendance;
		return $attendance.filter(
			(record) =>
				record.VolunteerID.Name.toLowerCase().includes($searchQuery.toLowerCase()) ||
				record.VolunteerID.Email.toLowerCase().includes($searchQuery.toLowerCase())
		);
	});
</script>

<LoadingScreen {loading}/>
<main class="container mx-auto p-4">
	<h1 class="text-2xl font-bold mb-4">Manual Volunteer Attendance</h1>
	<!-- <div class="overflow-x-auto"> -->
	<div class="flex flex-col md:flex-row items-center justify-between mb-4">
		<div class="mb-4 md:mb-0">
			<select id="date-select" class="select" bind:value={$selectedDate}>
				{#each $eventDays as day}
					<option value={day.toISOString().split('T')[0]}>{day.toDateString()}</option>
				{/each}
			</select>
		</div>
		<div class="flex flex-col md:flex-row">
			<input
				type="text"
				placeholder="Search by name or email"
				class="input"
				bind:value={$searchQuery}
			/>
		</div>
	</div>
	<div class="table-container mb-4 overflow-x-auto">
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
				{#each paginatedAttendance as record}
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
								on:click={() => toggleAttendance(record.VolunteerID._id, new Date($selectedDate))}
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
	<div class="flex items-center justify-center">
		<button
			class="pagination-btn pagination-btn-prev variant-filled"
			on:click={prevPage}
			disabled={$currentPage === 0}
		>
			<i class="fa-solid fa-chevron-left"></i>
		</button>
		<p class="pagination-info variant-filled">
			{$currentPage + 1} of {totalPages}
		</p>
		<button
			class="pagination-btn pagination-btn-next variant-filled"
			on:click={nextPage}
			disabled={$currentPage >= totalPages - 1}
		>
			<i class="fa-solid fa-chevron-right"></i>
		</button>
	</div>
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

	.pagination-btn {
		border: none;
		padding: 8px 16px;
		border-radius: 0;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.pagination-btn:disabled {
		background-color: #ccc;
		cursor: not-allowed;
	}

	.pagination-btn-prev {
		border-top-left-radius: 40px;
		border-bottom-left-radius: 40px;
	}

	.pagination-btn-next {
		border-top-right-radius: 40px;
		border-bottom-right-radius: 40px;
	}

	.pagination-info {
		padding: 8px 16px;
	}

	.pagination-btn:not(:disabled) + .pagination-info {
		border-left: 1px solid #353635;
	}

	.pagination-info + .pagination-btn:not(:disabled) {
		border-left: 1px solid #353635;
	}
</style>
