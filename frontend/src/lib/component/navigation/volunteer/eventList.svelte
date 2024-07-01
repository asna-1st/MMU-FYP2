<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getCookie } from 'svelte-cookie';
	import axiosInstance from '../../../scripts/axiosInstance';
	import utils from '../../../scripts/utils';

	let events = [];
	let isLoading = false;
	const token = getCookie('token');

	const loadMoreEvents = () => {
		// Simulate loading more events (replace this with actual data fetching logic)
		isLoading = true;
		setTimeout(() => {
			const newEvents = generateRandomEvents(5); // Function to generate random events
			events = [...events, ...newEvents];
			isLoading = false;
		}, 1000);
	};

	const handleScroll = () => {
		const scrollContainer = document.querySelector('.infinite-scroll-container');
		if (scrollContainer) {
			const { scrollTop, clientHeight, scrollHeight } = scrollContainer;
			if (scrollTop + clientHeight >= scrollHeight - 200) {
				loadMoreEvents();
			}
		}
	};

	async function fetchData() {
		try {
			isLoading = true;
			const resp = await axiosInstance.post(`/event/available`, null, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			const data = resp.data;
			console.log(data);
			events = [...data.events];
		} catch (err) {
			console.error('Error fetching data:', err);
		} finally {
			isLoading = false;
		}
	}

	onMount(async () => {
		// Generate initial events when the page is first loaded
		await fetchData();
		//events = generateRandomEvents(30); // Adjust the initial count as needed
	});
</script>

<main class="container mx-auto mt-8 p-4">
	<h1 class="text-4xl font-bold mb-4">Available Event</h1>

	<div class="infinite-scroll-container" style="height: 100vh; overflow-y: auto;">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{#each events as event (event._id)}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					on:click={() => {
						goto('/volunteer/event/' + event._id);
					}}
					class="bg-white card card-hover overflow-hidden shadow-md variant-filled"
				>
					<div class="p-4">
						<h2 class="text-2xl font-semibold mb-2">{event.Name}</h2>
						<p><span class="font-semibold">Start Date: </span>{utils.formatDateToInput(event.StartDate)}</p>
						<p><span class="font-semibold">End Date: </span>{utils.formatDateToInput(event.EndDate)}</p>
						<p><span class="font-semibold">Organization: </span>{event.OrganizationID.Name}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>

	{#if isLoading}
		<p>Loading...</p>
	{/if}
</main>

<style>
	/* You can add custom styles here if needed */
</style>
