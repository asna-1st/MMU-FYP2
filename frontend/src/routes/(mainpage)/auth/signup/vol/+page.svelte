<!-- src/App.svelte -->
<script>
	import { onMount } from 'svelte';
	let fullName = '';
	let email = '';
	let password = '';
	let address = '';
	let country = '';
	let countryState = '';
	let countryPostcode = '';

	let responseMessage = '';

	const register = async () => {
		try {
			const response = await fetch('http://localhost:5000/api/signup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					fullName,
					email,
					password,
					address,
					country
				})
			});

			const data = await response.json();

			if (response.ok) {
				// Registration successful
				responseMessage = data.message;
			} else {
				// Registration failed
				if (data.errors) {
					// Server-side validation errors
					// Displaying the first error for simplicity
					responseMessage = data.errors[0].msg;
				} else {
					// Other errors
					responseMessage = data.error || 'Registration failed';
				}
			}
		} catch (error) {
			console.error(error);
			responseMessage = 'Internal server error';
		}
	};

	onMount(() => {
		// Add your dark mode logic here if needed
	});
</script>

<div class="container h-full mx-auto flex flex-col justify-center">
  <header class="text-center py-4">
    <div class="text-center mb-2 text-3xl font-bold">Register as Volunteer</div>
  </header>
  <div class="card p-6 space-y-6 shadow-xl text-left">
    <form class="space-y-4">
		<label class="label">
			<span>Name</span>
			<input type="email" placeholder="Your Name" class="input" bind:value={email}/>
		  </label>
      <label class="label">
        <span>Email</span>
        <input type="email" placeholder="Your email" class="input" bind:value={email}/>
      </label>
      <label class="label">
        <span>Password</span>
        <input type="password" placeholder="Your password" class="input" bind:value={password}/>
      </label>
      <label class="label">
        <span>Re-Type Password</span>
        <input type="password" placeholder="Your password" class="input" bind:value={password}/>
      </label>
      <!-- <label class="label">
        <span>Address</span>
        <textarea placeholder="Address" class="textarea" bind:value={address} rows="4"/>
      </label> -->
      <label class="label">
        <span>Country</span>
		<select class="select">
			<option value="1">Malaysia</option>
			<option value="2">Option 2</option>
			<option value="3">Option 3</option>
			<option value="4">Option 4</option>
			<option value="5">Option 5</option>
		</select>
      </label>
      <button class="btn variant-filled-primary w-full">Register</button>
    </form>
  </div>
</div>

<style>
	/* Add your custom styles here */
</style>
