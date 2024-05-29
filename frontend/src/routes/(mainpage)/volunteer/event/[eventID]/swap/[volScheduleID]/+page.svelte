<!-- src/routes/events/[id]/EventDetails.svelte -->
<script>
	import { onMount } from 'svelte';
	import { DateTime } from 'luxon';
	import axiosInstance from '../../../../../../../lib/scripts/axiosInstance.js';
	

	export let data;

	let token;
	const eventID = data.eventID;
	const volunteerScheduleID = data.volScheduleID;
	let eventDetail = '';
	let schedules = [];
	let buttonText;

	onMount(async () => {
		token = getCookie('token');
		await fetchEventData();
		await fetchScheduleData();
		console.log(volunteerScheduleID)
	});

	function getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop().split(';').shift();
	}

	async function fetchEventData() {
		try {
			const resp = await axiosInstance.post(
				'/event/detail',
				{ eventID },
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);

			const data = resp.data;
			eventDetail = data.eventDetail;
		} catch (err) {
			console.error(err);
		}
	}

	async function fetchScheduleData() {
		try {
			const resp = await axiosInstance.post(
				'/schedule/list',
				{ eventID },
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);

			const data = resp.data;
			schedules = [...data.schedule];
			console.log(schedules)
		} catch (err) {
			console.error(err);
		}
	}

	function isArrayEmpty(array) {
		return array.length === 0;
	}

	function convertTimeString(dateTime) {
		const time = DateTime.fromISO(dateTime);
		return time.toFormat('h:mm a');
	}

	function convertDateString(dateTime) {
		const date = DateTime.fromISO(dateTime);
		return date.toFormat('d LLLL y');
	}

	function convertTimeInput(dateTime) {
		const time = new Date(dateTime);
		const hours = time.getHours().toString().padStart(2, '0');
		const minutes = time.getMinutes().toString().padStart(2, '0');
		return hours + ':' + minutes;
	}

	async function swapSchedule(scheduleID) {
		try {
			const resp = await axiosInstance.post(
				'/schedule/swap',
				{ scheduleID, volunteerScheduleID },
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);

			if (resp.data.success == true) {
				fetchScheduleData();
			}
			console.log(schedules)
		} catch (err) {
			console.error(err);
		}
	}

	function isAnyScheduleJoined() {
		return schedules.some((schedule) => schedule.isScheduled);
	}
</script>

<main class="container mx-auto p-6">
	<h1 class="text-3xl font-bold mb-4">{eventDetail.Name}</h1>
	<div class="mb-4">
		<p class="">Organizer: {eventDetail.OrganizationID}</p>
		<p class="">Description: {eventDetail.Description}</p>
		<p class="">Address: {eventDetail.Address}</p>
		<p class="">Country: {eventDetail.Country}</p>
		<p class="">Start Date: {convertDateString(eventDetail.StartDate)}</p>
		<p class="">End Date: {convertDateString(eventDetail.EndDate)}</p>
	</div>

	<h2 class="text-2xl font-bold mb-4 pt-5">Jobs</h2>
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#if isArrayEmpty(schedules)}
			<p>No jobs available</p>
		{:else}
			{#each schedules as schedule (schedule._id)}
				<div class="p-6 shadow-md card variant-filled">
					<h3 class="text-xl font-semibold mb-2">{schedule.Name}</h3>
					<p class="">{schedule.Description}</p>
					<p class="">Date: 20-1-2024</p>
					<p class="">Begin: {convertTimeString(schedule.BeginAt)}</p>
					<p class="">End: {convertTimeString(schedule.EndAt)}</p>
					<p class="inline-block mt-4">
						{schedule.volunteerCount}/{schedule.MaxVolunteer} Available
					</p>
					<div class="inline-block float-right mt-2">
						{#if schedule.isScheduled}
							<button
								class="inline-block btn variant-filled-primary float-right"
								on:click={swapSchedule(schedule._id)}
								disabled={isAnyScheduleJoined()}>Joined</button
							>
						{:else}
							<button
								class="inline-block btn variant-filled-primary float-right"
								on:click={swapSchedule(schedule._id)}>Swap</button
							>
						{/if}
					</div>
				</div>
			{/each}
		{/if}
	</div>
</main>

<style>
	/* Additional styling or customization can be added here */
</style>
