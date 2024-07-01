<script>
	import { onMount } from 'svelte';
	import { DateTime } from 'luxon';
	import axiosInstance from '../../../../../lib/scripts/axiosInstance.js';
	import { writable } from 'svelte/store';
	import LoadingScreen from '../../../../../lib/component/LoadingScreen.svelte';

	export let data;

	let token;
	const eventID = data.eventID;
	let eventDetail = '';
	let schedules = [];
	const loading = writable(true);

	onMount(async () => {
		token = getCookie('token');
		await fetchEventData();
		await fetchScheduleData();
		loading.set(false);
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
			//console.log(schedules)
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

	async function joinSchedule(scheduleID) {
		try {
			const resp = await axiosInstance.post(
				'/schedule/join',
				{ scheduleID },
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);

			if (resp.data.success === true) {
				await fetchScheduleData();
			}
		} catch (err) {
			console.error(err);
		}
	}

	function isAnyScheduleJoined() {
		return schedules.some((schedule) => schedule.isScheduled);
	}
</script>

<LoadingScreen {loading} />
<main class="container mx-auto p-6">
	<h1 class="text-3xl font-bold mb-4">{eventDetail.Name}</h1>
	<div class="mb-4 space-y-1">
        <p><span class="font-semibold">Description: </span>{eventDetail.Description}</p>
        <p><span class="font-semibold">Address: </span>{eventDetail.Address}</p>
        <p><span class="font-semibold">Country: </span>{eventDetail.Country}</p>
        <p><span class="font-semibold">Start Date: </span>{convertDateString(eventDetail.StartDate)}</p>
        <p><span class="font-semibold">End Date: </span>{convertDateString(eventDetail.EndDate)}</p>
    </div>
	<h2 class="text-2xl font-bold mb-4 pt-5">Jobs</h2>
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#if isArrayEmpty(schedules)}
			<p>No schedules or jobs available.</p>
		{:else}
			{#each schedules as schedule}
				<div class="p-6 shadow-md card variant-filled">
					<h3 class="text-xl font-semibold mb-2">{schedule.Name}</h3>
					<p class="">{schedule.Description}</p>
					<p><span class="font-semibold">Begin: </span> {convertTimeString(schedule.BeginAt)}</p>
					<p><span class="font-semibold">End: </span>{convertTimeString(schedule.EndAt)}</p>
					<p class="inline-block mt-4">
						{#if schedule.volunteerCount === 0}
							0/{schedule.MaxVolunteer} Available
						{:else}
							{schedule.volunteerCount}/{schedule.MaxVolunteer} Available
						{/if}
					</p>
					<div class="inline-block float-right mt-2">
						{#if schedule.isScheduled}
							<button
								class="inline-block btn variant-filled-primary float-right"
								on:click={joinSchedule(schedule._id)}
								disabled={schedule.isScheduled || isAnyScheduleJoined()}>Joined</button
							>
						{:else}
							<button
								class="inline-block btn variant-filled-primary float-right"
								on:click={joinSchedule(schedule._id)}
								disabled={schedule.isScheduled || isAnyScheduleJoined()}>Join</button
							>
						{/if}
					</div>
				</div>
			{/each}
		{/if}
	</div>
</main>