<script>
	import CardSchedule from './cardSchedule.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import axiosInstance from '../../../scripts/axiosInstance';
	import { getCookie } from 'svelte-cookie';
	import utils from '../../../scripts/utils';
	/** @type {import('./$types').PageData} */
	//export let data;

	let token;
	let schedules = [];

	async function fetchData() {
		try {
			//isLoading = true;
			const resp = await axiosInstance.post(`/schedule/volunteer`, null, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			schedules = resp.data.schedules;
			console.log(schedules);
		} catch (err) {
			console.error('Error fetching data:', err);
		} finally {
			//isLoading = false;
		}
	}

	async function removeSchedule(volScheduleID) {
		try {
			const resp = await axiosInstance.post('/schedule/remove', 
			{volunteerScheduleID: volScheduleID},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			if (resp.data.success == true) {
				fetchData();
			}
		} catch (err) {}
	}

	onMount(async () => {
		token = getCookie('token');
		await fetchData();
	});
</script>

<div class="container mx-auto mt-8 p-4">
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		<!-- {#each jobs as job (job.title)}
			<div class="p-3 shadow-md card card-hover variant-filled">
				<h3 class="text-xl font-semibold mb-2">{job.title}</h3>
				<p class="">Description: {job.description}</p>
				<p>Event: {job.event}</p>
				<p>Date: {job.date}</p>
				<p>Time: {job.time}</p>
				<div class="inline-block float-right mt-3">
					<button on:click={() => {goto('/chat/test')}} class="btn variant-filled-primary mb-2">Chat</button>
					<button on:click={() => {goto('/attendance/volAtt')}} class="btn variant-filled-primary mb-2">Attendance</button>
					<button on:click={() => {goto()}} class="btn variant-filled-primary mb-2">Swap</button>
					<button on:click={() => {}} class="btn variant-filled-error mb-2">Remove</button>
				</div>
			</div>
		{/each} -->
		{#each schedules as { schedule, eventName, eventStartDate, eventEndDate, _id }}
			<div class="p-3 shadow-md card card-hover variant-filled">
				<h3 class="text-xl font-semibold mb-2">{schedule.Name}</h3>
				<p>{schedule.Description}</p>
				<p><span class="font-semibold">Event: </span>{eventName}</p>
				<p><span class="font-semibold">Date: </span>{utils.formatDateToInput(eventStartDate)} - {utils.formatDateToInput(eventEndDate)}</p>
				<p><span class="font-semibold">Time: </span>{utils.convertTimeInput(schedule.BeginAt)} - {utils.convertTimeInput(schedule.EndAt)}</p>
				<div class="inline-block float-right mt-3">
					<button
						on:click={() => {
							goto('/chat/' + schedule.EventID);
						}}
						class="btn variant-filled-primary mb-2">Chat</button
					>
					<button
						on:click={() => {
							goto('/volunteer/attendance/' + _id);
						}}
						class="btn variant-filled-primary mb-2">Attendance</button
					>
					<button
						on:click={() => {
							goto('/volunteer/event/' + schedule.EventID + '/swap/' + _id);
						}}
						class="btn variant-filled-primary mb-2">Swap</button
					>
					<button on:click={() => removeSchedule(_id)} class="btn variant-filled-error mb-2">Remove</button>
				</div>
			</div>
		{/each}
	</div>
</div>
