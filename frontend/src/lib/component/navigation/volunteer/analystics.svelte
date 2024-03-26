<script>
	import { onMount } from 'svelte';

	let totalEvents = 0;
	let totalUsers = 0;
	let perEventAnalytics = [];

	// Simulated data, replace with actual API calls or data fetching
	const fetchData = () => {
		totalEvents = 10; // Replace with actual total events count
		totalUsers = 100; // Replace with actual total users count

		perEventAnalytics = [
			{ eventName: 'Event 1', totalVolunteers: 20 },
			{ eventName: 'Event 2', totalVolunteers: 15 }
			// Add more events as needed
		];
	};

	onMount(() => {
		fetchData();
	});
</script>

<main class="container mx-auto mt-8 p-4">
	<h1 class="text-4xl font-bold mb-4">Analytics</h1>
	<section class="card p-6 mb-8">
		<h2 class="text-xl font-semibold mb-4">Overall Analytics</h2>
		<div class="grid grid-cols-2 gap-4">
			<div class="p-4 card variant-filled-primary">
				<p class="text-sm uppercase">Total Events</p>
				<p class="text-3xl font-semibold">{totalEvents}</p>
			</div>
			<div class="p-4 card variant-filled-secondary">
				<p class="text-sm uppercase">Total Users</p>
				<p class="text-3xl font-semibold">{totalUsers}</p>
			</div>
		</div>
	</section>

	<section class="card p-6">
		<h2 class="text-xl font-semibold mb-4">Per Event Analytics</h2>
		{#each perEventAnalytics as { eventName, totalVolunteers }}
			<div class="card mt-4 p-4 variant-filled-surface">
				<p class="text-lg font-semibold">{eventName}</p>
				<p class="">{totalVolunteers} Volunteers Joined</p>
			</div>
		{/each}
	</section>
</main>
