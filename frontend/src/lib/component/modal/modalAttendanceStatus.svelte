<!-- <script>
    import { getModalStore } from '@skeletonlabs/skeleton';

    export let parent;

    const modalStore = getModalStore();

    const formData = {
        eventName: '',
        description: '',
        startDate: '',
        endDate: '',
        address: '',
        country: ''
    }

    function onFormSubmit() {
        if ($modalStore[0].response) $modalStore[0].response(formData);
        modalStore.close();
    }

    const cBase = 'card p-4 w-modal shadow-xl space-y-4';
    const cHeader = 'text-2xl font-bold';
    const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';
</script>

{#if $modalStore[0]}
    <div class="modal-example-form {cBase}">
        <header class="{cHeader}">{$modalStore[0].title ?? '(title missing)'}</header>
        <article>{$modalStore[0].body ?? '(body missing)'}</article>
        <form class="modal-form {cForm}">
            <label class="label">
                <span>Event Name</span>
                <input class="input" type="text" bind:value={formData.eventName} required/>
            </label>
            <label class="label">
                <span>Description</span>
                <textarea class="textarea" rows="3" bind:value={formData.description} required/>
            </label>
            <label class="label">
                <span>Start Date</span>
                <input class="input" type="date" bind:value={formData.startDate} required/>
            </label>
            <label class="label">
                <span>End Date</span>
                <input class="input" type="date" bind:value={formData.endDate} required/>
            </label>
            <label class="label">
                <span>Address</span>
                <textarea class="textarea" rows="4" bind:value={formData.address} required/>
            </label>
            <label class="label">
                <span>Country</span>
                <select class="select" bind:value={formData.country} required>
                    <option value="1">Malaysia</option>
                </select>
            </label>
        </form>

        <footer class="modal-footer {parent.regionFooter}">
            <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
            <button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Create</button>
        </footer>
    </div>
{/if} -->

<script>
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';
	import axiosInstance from '../../scripts/axiosInstance';

	export let parent;
	let dateMap = writable({});
	let error = writable(null);

	const modalStore = getModalStore();
	const volunteerScheduleId = $modalStore[0].meta.volScheduleID;

	let token;

	onMount(async () => {
		token = getCookie('token');
		try {
			const { StartDate, EndDate, attendances } = await getAttendanceStatus(volunteerScheduleId);
			const processedData = processAttendanceData(StartDate, EndDate, attendances);
			dateMap.set(processedData);
		} catch (err) {
			error.set(err);
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

		// Initialize the map with event dates
		let currentDate = new Date(startDate);
		while (currentDate <= new Date(endDate)) {
			const dateString = currentDate.toISOString().split('T')[0];
			dateMap[dateString] = { checkIn: null, checkOut: null };
			currentDate.setDate(currentDate.getDate() + 1);
		}

		// Populate the map with attendance data
		attendances.forEach((attendance) => {
			const date = new Date(attendance.Date).toISOString().split('T')[0];
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
								<td
									>{$dateMap[date].checkIn
										? new Date($dateMap[date].checkIn).toLocaleTimeString()
										: 'No check-in'}</td
								>
								<td
									>{$dateMap[date].checkOut
										? new Date($dateMap[date].checkOut).toLocaleTimeString()
										: 'No check-out'}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}
				>{parent.buttonTextCancel}</button
			>
		</footer>
	</div>
{/if}

<style>
	.table-container {
		max-height: 300px; /* Adjust as needed */
		overflow-y: auto;
	}
</style>
