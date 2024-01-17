<!-- src/App.svelte -->
<script>
    import { onMount } from 'svelte';
    let fullName = '';
    let email = '';
    let password = '';
    let address = '';
    let country = '';
  
    let responseMessage = '';
  
    const register = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName,
            email,
            password,
            address,
            country,
          }),
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
  
  <main class="container mt-5">
    <div class="card">
      <div class="card-header">
        Registration
      </div>
      <div class="card-body">
        {#if responseMessage}
          <p class={responseMessage.includes('successful') ? 'text-success' : 'text-danger'}>
            {responseMessage}
          </p>
        {/if}
        <div class="mb-3">
          <label for="fullName" class="form-label">Full Name</label>
          <input type="text" class="form-control" bind:value={fullName} id="fullName">
        </div>
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input type="email" class="form-control" bind:value={email} id="email">
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input type="password" class="form-control" bind:value={password} id="password">
        </div>
        <div class="mb-3">
          <label for="address" class="form-label">Address</label>
          <input type="text" class="form-control" bind:value={address} id="address">
        </div>
        <div class="mb-3">
          <label for="country" class="form-label">Country</label>
          <input type="text" class="form-control" bind:value={country} id="country">
        </div>
        <button class="btn btn-primary" on:click={register}>Register</button>
      </div>
    </div>
  </main>
  
  <style>
    /* Add your custom styles here */
  </style>
  