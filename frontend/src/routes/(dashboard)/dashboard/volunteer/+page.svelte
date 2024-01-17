<script>
	import { onMount } from 'svelte';
	import { blur, crossfade, fade } from 'svelte/transition'
	import { dataDash } from '$lib/scripts/dataDash.js';
	import EventList from '../../../../lib/component/navigation/volunteer/eventList.svelte';
	import ScheduleList from '../../../../lib/component/navigation/volunteer/scheduleList.svelte';
	const views = [EventList, ScheduleList];

	let pageData;

	onMount(() => {
		dataDash.subscribe((value) => {
			pageData = value;
			console.log(value);
		});
	});

	let viewportComponent = null;

	function updatePage() {
		viewportComponent = views[pageData];
	}

	updatePage()
</script>

{#if viewportComponent == views[pageData]}
	<div id="viewport" class="container h-full mx-auto flex flex-col justify-center" on:outroend={updatePage} transition:blur={{duration:200}}>
		<svelte:component this={viewportComponent}></svelte:component>
	</div>
{/if}
