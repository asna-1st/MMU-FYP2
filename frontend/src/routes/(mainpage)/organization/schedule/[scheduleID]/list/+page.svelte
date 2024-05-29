<script>
	import { onDestroy, onMount } from 'svelte';
	import axiosInstance from '../../../../../../lib/scripts/axiosInstance.js';

	export let data;

	let token;
	const scheduleID = data.scheduleID;
	console.log(scheduleID);
	let volunteers = [];

	async function fetchVolunteerData() {
		try {
			const resp = await axiosInstance.post(
				'/schedule/volunteer/list',
				{ scheduleID },
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);

			const data = resp.data;
			volunteers = data.volunteerList;
			console.log(volunteers);
		} catch (err) {
			console.error(err);
		}
	}

	async function removeVolunteer(volunteerID, scheduleID) {
		try {
			const resp = await axiosInstance.post(
				'/schedule/remove',
				{ volunteerID, scheduleID },
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);
			if (resp.data.success == true) {
				await fetchVolunteerData();
			}
		} catch (err) {}
	}

	onMount(async () => {
		token = getCookie('token');
		await fetchVolunteerData();
	});

	function getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop().split(';').shift();
	}
</script>

<main class="container mx-auto p-4">
	<h1 class="text-2xl font-bold mb-4">Volunteer List</h1>

	{#if volunteers.length === 0}
		<p>No volunteers registered for this event.</p>
	{:else}
		<div class="table-container pt-5">
			<table class="table table-hover">
				<thead>
					<tr>
						<th>Name</th>
						<th>Email</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					{#each volunteers as volunteer (volunteer._id)}
						<tr>
							<td>{volunteer.Name}</td>
							<td>{volunteer.Email}</td>
							<td>
								<button
									class="btn btn-sm remove-button variant-filled-error"
									on:click={() => removeVolunteer(volunteer._id, scheduleID)}
								>
									Remove
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</main>

<!-- <main class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">{event.eventName} Volunteer List</h1>
  
    <div class="mb-4">
      <p class="text-gray-600">{volunteerCount} volunteers registered for this event.</p>
    </div>
  
    {#if volunteerCount === 0}
      <p>No volunteers registered for this event.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr>
              <th class="sm:table-cell">Name</th>
              <th class="sm:table-cell">Email</th>
              <th class="sm:table-cell">Action</th>
            </tr>
          </thead>
          <tbody>
            {#each volunteers as volunteer (volunteer.id)}
              <tr>
                <td class="sm:table-cell">{volunteer.name}</td>
                <td class="sm:table-cell">{volunteer.email}</td>
                <td class="sm:table-cell">
                  <button
                    class="remove-button"
                    on:click={() => removeVolunteer(volunteer.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </main> -->

<style>
	/* Add your styling here */
	.remove-button {
		background-color: #ff4c4c;
		color: #fff;
	}
</style>
