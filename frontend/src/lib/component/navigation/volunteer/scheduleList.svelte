<script>
	import CardSchedule from './cardSchedule.svelte';
	import { goto } from '$app/navigation';
	/** @type {import('./$types').PageData} */
	//export let data;

	let jobs = [
		{
			title: 'Job 1',
			description: 'Description 1',
			event: 'Test Event 1',
			organizer: 'testOrg 1',
			date: '22-01-2024',
			time: '9:30 AM'
		},
		{
			title: 'Job 2',
			description: 'Description 2',
			event: 'Test Event 1',
			organizer: 'testOrg 1',
			date: '22-01-2024',
			time: '9:30 AM'
		},
		{
			title: 'Job 3',
			description: 'Description 1',
			event: 'Test Event 1',
			organizer: 'testOrg 1',
			date: '22-01-2024',
			time: '9:30 AM'
		},
		{
			title: 'Job 4',
			description: 'Description 2',
			event: 'Test Event 1',
			organizer: 'testOrg 1',
			date: '22-01-2024',
			time: '9:30 AM'
		},
	];
</script>

<div class="container mx-auto mt-8 p-4">
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each jobs as job (job.title)}
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
		{/each}
	</div>
</div>
