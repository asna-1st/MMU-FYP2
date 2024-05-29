<script>
	import { getModalStore } from '@skeletonlabs/skeleton';

	export let parent;

	const modalStore = getModalStore();

	const formData = {
		scheduleName: '',
		description: '',
		date: '',
		startTime: '',
		endTime: '',
        maxVolunteer: '',
        eventID: $modalStore[0].meta.eventID
	};

	function onFormSubmit() {
		//const isValid = validateForm();
		//if (isValid) {
			if ($modalStore[0].response) $modalStore[0].response(formData);
			modalStore.close();
		//}
	}

	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>{$modalStore[0].title ?? '(title missing)'}</header>
		<article>{$modalStore[0].body ?? '(body missing)'}</article>
		<form class="modal-form {cForm}">
			<label class="label">
				<span>Job Name</span>
				<input class="input" type="text" bind:value={formData.scheduleName}/>
			</label>
			<label class="label">
				<span>Description</span>
				<textarea class="textarea" rows="3" bind:value={formData.description}/>
			</label>
			<label class="label">
				<span>Date</span>
				<input class="input" type="date" bind:value={formData.date}/>
			</label>
			<label class="label">
				<span>Start</span>
				<input class="input" type="time" bind:value={formData.startTime}/>
			</label>
			<label class="label">
				<span>End</span>
				<input class="input" type="time" bind:value={formData.endTime}/>
			</label>
            <label class="label">
				<span>Max Volunteer</span>
				<input class="input" type="number" bind:value={formData.maxVolunteer}/>
			</label>
		</form>

		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}
				>{parent.buttonTextCancel}</button
			>
			<button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Create</button>
		</footer>
	</div>
{/if}
