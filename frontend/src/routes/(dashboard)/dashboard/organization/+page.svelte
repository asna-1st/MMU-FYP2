<script>
	import { onMount, onDestroy } from 'svelte';
	import { blur, crossfade, fade } from 'svelte/transition';
	import { dataDash } from '$lib/stores/dataDash.js';
	import EventList from '../../../../lib/component/navigation/volunteer/eventListOrg.svelte';
	import ScheduleList from '../../../../lib/component/navigation/volunteer/scheduleList.svelte';
	// import TestQr from '../../../../lib/component/TestQR.svelte';
	import EditProfileOrg from '../../../../lib/component/navigation/volunteer/editProfileOrg.svelte';
	import Analystics from '../../../../lib/component/navigation/volunteer/analystics.svelte';
	import QrScanner from '../../../../lib/component/QRScanner.svelte';

	const views = [EventList, QrScanner, Analystics, EditProfileOrg];

	let pageData;
	let previousPage;

	onMount(() => {
		dataDash.subscribe((value) => {
			pageData = value;
			//console.log(value);
		});
	});

	let viewportComponent = null;

	function updatePage() {
		viewportComponent = views[pageData];
		//console.log(viewportComponent);
		
	}

	updatePage();
</script>

{#if viewportComponent == views[pageData]}
	<div
		id="viewport"
		class="container h-full mx-auto flex flex-col pt-6"
		on:outroend={updatePage}
		transition:blur={{ duration: 200 }}
	>
		<svelte:component this={viewportComponent}></svelte:component>
	</div>
{/if}

<style>
</style>
