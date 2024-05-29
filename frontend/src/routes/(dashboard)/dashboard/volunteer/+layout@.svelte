<script>
	import { AppRail, AppRailTile, AppRailAnchor, Avatar, AppShell, initializeStores, Modal, Toast } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import '../../../../app.postcss';
	import { dataDash } from '$lib/stores/dataDash';
	import CheckAuth from '../../../../lib/component/checkAuth.svelte';
	import { setCookie } from 'svelte-cookie';
	import {goto} from '$app/navigation';
	let currentTile = 0;
	let previous;

	initializeStores();

	onMount(() => {
		dataDash.subscribe((value) => {
			currentTile = value;
			//console.log(value);
		});
	});

	$: {
		if (currentTile !== previous) {
			dataDash.set(currentTile);
		}
	}
	 function signOut() {
		setCookie('token', 0, 0, true);
        goto('/')
	 }
</script>

<CheckAuth />
<Modal />
<Toast />
<AppShell>
	<svelte:fragment slot="sidebarLeft">
		<AppRail>
			<svelte:fragment slot="lead">
				
			</svelte:fragment>
			<!-- --- -->
			<AppRailTile bind:group={currentTile} name="tile-1" value={0} title="tile-1">
				<svelte:fragment slot="lead">
					<div class="flex items-center justify-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="w-6 h-6"
						>
							<path
								fill-rule="evenodd"
								d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
				</svelte:fragment>
				<span>Find</span>
			</AppRailTile>
			<AppRailTile bind:group={currentTile} name="tile-2" value={1} title="tile-2">
				<svelte:fragment slot="lead">
					<div class="flex items-center justify-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="w-6 h-6"
						>
							<path
								fill-rule="evenodd"
								d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
				</svelte:fragment>
				<span>Schedule</span>
			</AppRailTile>
			<AppRailTile bind:group={currentTile} name="tile-3" value={2} title="tile-3">
				<svelte:fragment slot="lead">
					<div class="flex items-center justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-6 h-6" viewBox="0 0 16 16">
							<path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
						  </svg>
					</div>
				</svelte:fragment>
				<span>Profile</span>
			</AppRailTile>
			<!-- --- -->
			<svelte:fragment slot="trail">
				<AppRailAnchor href="#" on:click={() => signOut()} title="Account">Sign Out</AppRailAnchor>
			</svelte:fragment>
		</AppRail>
	</svelte:fragment>
	<slot />
</AppShell>

<style>
</style>
