<main class="container mx-auto mt-8 p-4">
	<h1 class="text-4xl font-bold mb-4">Profile</h1>
	<div class="card p-6 space-y-6 shadow-xl text-left">
		<form class="space-y-4">
			<label class="label">
				<span>Name</span>
				<input type="email" placeholder="Your Name" class="input" value="Test Volunteer" readonly />
			</label>
			<label class="label">
				<span>Email</span>
				<input
					type="email"
					placeholder="Your email"
					class="input"
					value="test@email.com"
					readonly
				/>
			</label>
			<!-- <label class="label">
            <span>Address</span>
            <textarea placeholder="Address" class="textarea" bind:value={address} rows="4"/>
          </label> -->
			<label class="label">
				<span>Country</span>
				<input
					type="email"
					placeholder="Your email"
					class="input"
					value="Malaysia"
					readonly
				/>
			</label>

				<button class="btn variant-filled-primary w-full">Edit</button>
				<button class="btn variant-filled-error w-full">Delete</button>
		</form>
	</div>
</main>
