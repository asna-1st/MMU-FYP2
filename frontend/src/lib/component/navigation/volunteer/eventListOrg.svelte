<script>
	import { onMount } from 'svelte';
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
	import ModalCreateEvent from '../../modal/modalCreateEvent.svelte';
	import { goto } from '$app/navigation';
	import axiosInstance from '../../../scripts/axiosInstance';
	import { getCookie } from 'svelte-cookie';

	//let events = [];
	//let isLoading = false;
	const token = getCookie('token');

	let events = [];
	let page = 1;
	let isLoading = false;
	let lastScrollTop = 0;

	async function fetchData() {
		try {
			isLoading = true;
			const resp = await axiosInstance.get(`/event/list?page=${page}`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			const data = resp.data;
			console.log(data);
			events = [...events, ...data.events];
			page++;
		} catch (err) {
			console.error('Error fetching data:', err);
		} finally {
			isLoading = false;
		}
	}

	/* const loadMoreEvents = () => {
		// Simulate loading more events (replace this with actual data fetching logic)
		isLoading = true;
		setTimeout(() => {
			const newEvents = generateRandomEvents(5); // Function to generate random events
			events = [...events, ...newEvents];
			isLoading = false;
		}, 1000);
	}; */

	/* const handleScroll = () => {
		const scrollContainer = document.querySelector('.infinite-scroll-container');
		if (scrollContainer) {
			const { scrollTop, clientHeight, scrollHeight } = scrollContainer;
			if (scrollTop + clientHeight >= scrollHeight - 200) {
				loadMoreEvents();
			}
		}
	}; */

	function debounce(func, wait) {
		let timeout;
		return function (...args) {
			const context = this;
			clearTimeout(timeout);
			timeout = setTimeout(() => func.apply(context, args), wait);
		};
	}

	const debouncedFetchData = debounce(fetchData, 200);

	function handleScroll(event) {
		const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

		// Check if scrolling down and not at the top of the page
		if (scrollTop > lastScrollTop && scrollTop + clientHeight >= scrollHeight - 100 && !isLoading) {
			debouncedFetchData();
		}

		lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
	}

	onMount(() => {
		// Generate initial events when the page is first loaded
		//loadMoreEvents(); // Adjust the initial count as needed
		fetchData();
	});

	/* const generateRandomEvents = (count) => {
		// Function to generate random events for testing purposes
		const randomEvents = [];
		for (let i = 0; i < count; i++) {
			const newEvent = {
				id: events.length + i + 1,
				title: `Random Event ${events.length + i + 1}`,
				date: '2024-12-31', // Update with random date logic if needed
				location: 'Random Location',
				Organizer: 'Random Organizer'
			};
			randomEvents.push(newEvent);
		}
		return randomEvents;
	}; */

	const modalStore = getModalStore();
	const toastStore = getToastStore();

	const toastEventCreatead = {
		message: 'Event has been created.',
		timeout: 3000
	};

	const modalCreate = async () => {
		const c = { ref: ModalCreateEvent };
		const modal = {
			type: 'component',
			component: c,
			title: 'Create Event',
			body: 'Please enter event details',
			response: async (r) => {
				if (r) {
					try {
						const resp = await axiosInstance.post('/event/create', r, {
							headers: {
								Authorization: `Bearer ${token}`
							}
						});
						if (resp.data.success == true) {
							toastStore.trigger(toastEventCreatead);
							fetchData();
						}
					} catch (err) {}
				}
			}
		};
		modalStore.trigger(modal);
	};
</script>

<main class="container mx-auto mt-8 p-4" style="overflow-y: hidden;">
	<h1 class="text-4xl font-bold mb-4">Event</h1>
	<button type="button" class="btn variant-filled-primary mb-4" on:click={modalCreate}
		>Create</button
	>
	<div style="height: 100vh; overflow-y: auto;" on:scroll={handleScroll}>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{#each events as event (event._id)}
				<div class="bg-white card card-hover overflow-hidden shadow-md variant-filled">
					<div class="p-4">
						<h2 class="text-2xl font-semibold mb-2">{event.Name}</h2>
						<p class="">Start Date: {event.StartDate}</p>
						<p class="">End Date: {event.EndDate}</p>
						<div class="inline-block float-right mt-3">
							<button
								on:click={() => {
									goto('/chat/testUI/testEventJobOrg');
								}}
								class="btn variant-filled-primary mb-2">View</button
							>
							<button class="btn variant-filled-primary mb-2">Chat</button>
							<button class="btn variant-filled-error mb-2">Remove</button>
						</div>
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
</style>
