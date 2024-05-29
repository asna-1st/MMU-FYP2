<script>
	import { onMount } from 'svelte';
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
	import ModalEditProfileOrg from '../../modal/modalEditProfileOrg.svelte';
	import axiosInstance from '../../../scripts/axiosInstance';

	let token;
	let userDetail = null;

	onMount(async () => {
		token = getCookie('token');
		await fetchUserDetail();
	});

	const toastStore = getToastStore();

	const toastStatus = (message) => ({
		message: message,
		timeout: 3000
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

	const modalStore = getModalStore();

	const modalEditProfile = async () => {
		const c = { ref: ModalEditProfileOrg };
		const modal = {
			type: 'component',
			component: c,
			title: 'Edit Profile',
			meta: {
				userName: userDetail.Name,
				email: userDetail.Email,
				address: userDetail.Address,
				country: userDetail.Country
			},
			body: 'Please enter new profile details',
			response: async (r) => {
				if (r) {
					try {
						const resp = await axiosInstance.post('/user/edit', r, {
							headers: {
								Authorization: `Bearer ${token}`
							}
						});
						if (resp.data.success == true) {
							//toastStore.trigger(toastEventCreatead);
							await fetchUserDetail();
							toastStore.trigger(toastStatus('Profile details updated.'));
						}
					} catch (err) {}
				} else {
					await fetchUserDetail();
				}
			}
		};
		modalStore.trigger(modal);
	};

	function getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop().split(';').shift();
	}
</script>

<main class="container mx-auto mt-8 p-4">
	<h1 class="text-4xl font-bold mb-4">Profile</h1>
	<div class="card p-6 space-y-6 shadow-xl text-left">
		{#if userDetail}
		<form class="space-y-4">
			<label class="label">
				<span>Name</span>
				<input type="email" placeholder="Your Name" class="input" bind:value={userDetail.Name} readonly />
			</label>
			<label class="label">
				<span>Email</span>
				<input
					type="email"
					placeholder="Your email"
					class="input"
					bind:value={userDetail.Email}
					readonly
				/>
			</label>
			<label class="label">
				<span>Address</span>
				<textarea placeholder="Address" class="textarea" rows="4" bind:value={userDetail.Address} readonly/>
			</label>
			<label class="label">
				<span>Country</span>
				<input type="email" placeholder="Your email" class="input" bind:value={userDetail.Country} readonly />
			</label>

			<button class="btn variant-filled-primary w-full" on:click={modalEditProfile}>Edit</button>
			<button class="btn variant-filled-error w-full">Delete</button>
		</form>
		{:else}
			<p>Loading user details...</p>
		{/if}
	</div>
</main>