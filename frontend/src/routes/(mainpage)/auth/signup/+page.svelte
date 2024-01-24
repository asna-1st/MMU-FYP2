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
        <span>Email</span>
        <input type="email" placeholder="your-email@example.com" class="input" bind:value={email}/>
      </label>
      <label class="label">
        <span>Password</span>
        <input type="password" placeholder="Your password" class="input" bind:value={password}/>
      </label>
      <label class="label">
        <span>Re-Type Password</span>
        <input type="password" placeholder="Your password" class="input" bind:value={password}/>
      </label>
      <label class="label">
        <span>Address</span>
        <input type="text" placeholder="Address" class="input" bind:value={address}/>
      </label>
      <label class="label">
        <span>Country</span>
        <input type="text" placeholder="Country" class="input" bind:value={country}/>
      </label>
      <label class="label">
        <span>State</span>
        <input type="text" placeholder="State" class="input" bind:value={countryState}/>
      </label>
      <label class="label">
        <span>Postcode</span>
        <input type="text" placeholder="Postcode" class="input" bind:value={countryPostcode}/>
      </label>
      <button class="btn variant-filled-primary w-full">Login</button>
    </form>
  </div>
</div>

<style>
	/* Add your custom styles here */
</style>
