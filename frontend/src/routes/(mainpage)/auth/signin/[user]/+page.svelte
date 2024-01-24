<script>
	/** @type {import('./$types').PageData} */
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import axios from 'axios';
	import {setCookie, getCookie} from 'svelte-cookie';

	let email = '';
	let password = '';
	let message = '';

	const login = async () => {
		try {
			const resp = await axios.post('http://localhost:8083/signin', {
				email,
				password
			});

			const token = resp.data.token;

			setCookie('token', token, '1', true);

			goto('/dashboard/volunteer');
		} catch (error) {
			console.error('Error:', error);

			if (error.message && error.response) {
				message = error.response.data.message || 'Invalid username or password';
			} else {
				message = 'An error occurred during login';
			}
		}
	};

	onMount(() => {
		// Check if the user is already authenticated
		const token = getCookie('token');
		if (token) {
			window.location.href = '/dashboard';
		}
	});
</script>

<div class="wrapper">
	<div class="card space-y-6 p-6 pt-20 rounded-none max-w-full md:max-w-md form">
		<div class="text-center mb-12 text-3xl font-bold">Welcome back!</div>
		<form class="space-y-4">
			<p>{message}</p>
			<label class="label">
				<span>Email</span>
				<input type="email" placeholder="your-email@example.com" class="input mt-1" bind:value={email}/>
			</label>
			<label class="label">
				<span>Password</span>
				<input type="password" placeholder="Your password" class="input mt-1" bind:value={password}/>
			</label>
			<label class="inline-flex items-center">
				<input type="checkbox" placeholder="Your password" class="checkbox" />
				<span class="ml-2">Keep me logged in</span>
			</label>
		</form>
		<div class="text-center">
			<button class="btn variant-filled-primary w-full" on:click|preventDefault={login}>Login</button>
			<p class="py-2">
				Don't have an account? <a href="/auth/signup">Register</a>
			</p>
		</div>
	</div>
</div>

<style>
	.wrapper {
		min-height: 900px;
		background-size: cover;
		background-image: url(https://images.unsplash.com/photo-1484242857719-4b9144542727?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1280&q=80);
	}

	.form {
		min-height: 900px;
	}
</style>
