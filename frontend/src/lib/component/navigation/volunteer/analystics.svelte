<script>
	import { onMount } from 'svelte';
	import axiosInstance from '../../../scripts/axiosInstance';

	let userDetail;
	let token;
	let totalEvents = 0;
	let totalUsers = 0;
	let perEventAnalytics = [];

	// Simulated data, replace with actual API calls or data fetching
	const fetchData = async () => {
		try {
			const response = await axiosInstance.get('/analytics/' + userDetail._id, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			totalEvents = response.data.totalEvents;
			totalUsers = response.data.totalJoinedEvents;

			// Format per event analytics data
			perEventAnalytics = response.data.totalJoinedVolunteersPerEvent
			console.log(response.data.totalJoinedVolunteersPerEvent);
		} catch (error) {
			console.error('Error fetching analytics:', error);
		}
	};


	onMount(async () => {
		token = getCookie('token');
		await fetchUserDetail();
		await fetchData();
	});

	async function fetchUserDetail() {
		try {
			const resp = await axiosInstance.post(`/user/detail`, null, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			userDetail = resp.data.userDetail;
			console.log(userDetail);
		} catch (err) {
			console.error('Error fetching data:', err);
		}
	}

	function getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop().split(';').shift();
	}
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
		{#each perEventAnalytics as { eventName, totalJoinedVolunteers
		}}
			<div class="card mt-4 p-4 variant-filled-surface">
				<p class="text-lg font-semibold">{eventName}</p>
				<p class="">{totalJoinedVolunteers
				} Volunteers Joined</p>
			</div>
		{/each}
	</section>
</main>
