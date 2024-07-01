<!-- src/routes/events/[id]/EventDetails.svelte -->
<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import axiosInstance from '../../../../../../../lib/scripts/axiosInstance.js';
	import LoadingScreen from '../../../../../../../lib/component/LoadingScreen.svelte';
	import utils from '../../../../../../../lib/scripts/utils.js';

	export let data;

	let token;
	const eventID = data.eventID;
	const volunteerScheduleID = data.volScheduleID;
	let eventDetail = '';
	let organizationDetail = '';
	let schedules = [];
	const loading = writable(true);

	onMount(async () => {
		token = utils.getToken();
		await fetchEventData();
		await fetchScheduleData();
		console.log(volunteerScheduleID);
		loading.set(false);
	});

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
			organizationDetail = eventDetail.OrganizationID;
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
			console.log(schedules);
		} catch (err) {
			console.error(err);
		}
	}

	function isArrayEmpty(array) {
		return array.length === 0;
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
			console.log(schedules);
		} catch (err) {
			console.error(err);
		}
	}

	function isAnyScheduleJoined() {
		return schedules.some((schedule) => schedule.isScheduled);
	}
</script>

<LoadingScreen {loading}/>
<main class="container mx-auto p-6">
	<h1 class="text-3xl font-bold mb-4">{eventDetail.Name}</h1>
	<div class="mb-4 space-y-1">
		<p><span class="font-semibold">Organizer: </span>{organizationDetail.Name}</p>
		<p><span class="font-semibold">Description: </span>{eventDetail.Description}</p>
		<p><span class="font-semibold">Address: </span>{eventDetail.Address}</p>
		<p><span class="font-semibold">Country: </span>{eventDetail.Country}</p>
		<p><span class="font-semibold">Start Date: </span>{utils.formatDateToInput(eventDetail.StartDate)}</p>
		<p><span class="font-semibold">End Date: </span>{utils.formatDateToInput(eventDetail.EndDate)}</p>
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
					<p class="">Begin: {utils.convertTimeInput(schedule.BeginAt)}</p>
					<p class="">End: {utils.convertTimeInput(schedule.EndAt)}</p>
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
						{:else if schedule.volunteerCount == schedule.MaxVolunteer}
							<button
								class="inline-block btn variant-filled-primary float-right"
								on:click={swapSchedule(schedule._id)} disabled>Unvailable</button
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
