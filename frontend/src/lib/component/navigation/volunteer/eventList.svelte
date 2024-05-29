<!-- <script>
	import {
		Table,
		tableMapperValues,
		getModalStore,
		initializeStores,
		Modal
	} from '@skeletonlabs/skeleton';

	initializeStores();
	//const modalStore = getModalStore();

	let rowName;
	const sourceData = [
		{ eventName: 'testing', orgName: 'testOrg', loc: 'testLoc' },
		{ eventName: 'testing1', orgName: 'testOrg1', loc: 'testLoc1' },
		{ eventName: 'testing1', orgName: 'testOrg1', loc: 'testLoc1' },
		{ eventName: 'testing1', orgName: 'testOrg1', loc: 'testLoc1' },
		{ eventName: 'testing1', orgName: 'testOrg1', loc: 'testLoc1' },
		{ eventName: 'testing1', orgName: 'testOrg1', loc: 'testLoc1' },
		{ eventName: 'testing1', orgName: 'testOrg1', loc: 'testLoc1' },
		{ eventName: 'testing1', orgName: 'testOrg1', loc: 'testLoc1' },
		{ eventName: 'testing1', orgName: 'testOrg1', loc: 'testLoc1' }
	];

	const tableSimple = {
		head: ['Event', 'Organization', 'Location'],
		body: tableMapperValues(sourceData, ['eventName', 'orgName', 'loc'])
	};

	const modalStore = getModalStore();

	function selectedRow(meta) {
		const modal = {
			type: 'alert',
			// Data
			title: 'Example Alert',
			body: meta.detail[0]
		};

		modalStore.trigger(modal);
		console.log(meta.detail[0]);
	}
</script>

<div class="">
	<div class="mb-5">
		<h1 class="h1">Find Volunteer Oppurtinities</h1>
	</div>
	<div class="items-center">
		<Table source={tableSimple} interactive={true} on:selected={selectedRow} />
	</div>
	<Modal />
</div>
 -->

<!-- <script>
	let events = [
		{
			id: 1,
			title: 'Community Cleanup',
			date: '2024-02-15',
			location: 'City Park',
			Organizer: 'test'
		},
		{
			id: 2,
			title: 'Food Drive',
			date: '2024-03-05',
			location: 'Local Food Bank',
			Organizer: 'test2'
		},
		{
			id: 3,
			title: 'Beach Cleanup',
			date: '2024-03-20',
			location: 'Coastal Area',
			Organizer: 'test3'
		},
		{
			id: 4,
			title: 'Tree Planting',
			date: '2024-04-02',
			location: 'Green Park',
			Organizer: 'test4'
		},
		{
			id: 5,
			title: 'Animal Shelter Volunteering',
			date: '2024-04-15',
			location: 'City Animal Shelter',
			Organizer: 'test5'
		},
		{
			id: 6,
			title: 'Education Fair',
			date: '2024-05-01',
			location: 'Local School',
			Organizer: 'test6'
		},
		{
			id: 7,
			title: 'Blood Donation Camp',
			date: '2024-05-15',
			location: 'Community Center',
			Organizer: 'test7'
		},
		{
			id: 8,
			title: 'Elderly Care',
			date: '2024-06-02',
			location: 'Senior Living Home',
			Organizer: 'test8'
		},
		{
			id: 9,
			title: 'Park Restoration',
			date: '2024-06-20',
			location: 'City Park',
			Organizer: 'test9'
		},
		{
			id: 10,
			title: 'Community Garden Planting',
			date: '2024-07-05',
			location: 'Community Garden',
			Organizer: 'test10'
		},
		{
			id: 11,
			title: 'Soup Kitchen Volunteering',
			date: '2024-07-20',
			location: 'Local Soup Kitchen',
			Organizer: 'test11'
		},
		{
			id: 12,
			title: 'Homeless Shelter Support',
			date: '2024-08-01',
			location: 'City Homeless Shelter',
			Organizer: 'test12'
		},
		{
			id: 13,
			title: 'Green Energy Awareness',
			date: '2024-08-15',
			location: 'City Hall',
			Organizer: 'test13'
		},
		{
			id: 14,
			title: 'Book Donation Drive',
			date: '2024-09-02',
			location: 'Local Library',
			Organizer: 'test14'
		},
		{
			id: 15,
			title: 'Cancer Awareness Walk',
			date: '2024-09-20',
			location: 'City Streets',
			Organizer: 'test15'
		},
		{
			id: 16,
			title: 'Mental Health Seminar',
			date: '2024-10-05',
			location: 'Community Center',
			Organizer: 'test16'
		},
		{
			id: 17,
			title: 'Art and Craft Workshop',
			date: '2024-10-20',
			location: 'Local Community Center',
			Organizer: 'test17'
		},
		{
			id: 18,
			title: 'Community Fitness Class',
			date: '2024-11-02',
			location: 'City Park',
			Organizer: 'test18'
		},
		{
			id: 19,
			title: 'Winter Clothing Drive',
			date: '2024-11-20',
			location: 'Community Center',
			Organizer: 'test19'
		},
		{
			id: 20,
			title: 'Community Potluck',
			date: '2024-12-05',
			location: 'City Hall',
			Organizer: 'test20'
		}
	];
</script>

<main class="container mx-auto mt-8 p-4">
	<h1 class="text-4xl font-bold mb-4">Available event</h1>

	{#if events.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{#each events as event (event.id)}
				<div class="bg-white card card-hover overflow-hidden shadow-md variant-filled">
					<div class="p-4">
						<h2 class="text-2xl font-semibold mb-2">{event.title}</h2>
						<p class="">Date: {event.date}</p>
						<p class="">Organization: {event.Organizer}</p>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p>No events available.</p>
	{/if}
</main>

<style>
	/* You can add custom styles here if needed */
</style> -->

<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getCookie } from 'svelte-cookie';
	import axiosInstance from '../../../scripts/axiosInstance';

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

	const generateRandomEvents = (count) => {
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
	};
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
						<p class="">Start Date: {event.StartDate}</p>
						<p class="">End Date: {event.EndDate}</p>
						<p class="">Organization: {event.OrganizationID}</p>
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
