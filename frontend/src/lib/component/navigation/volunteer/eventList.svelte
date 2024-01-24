<script>
	import {
		Table,
		tableMapperValues,
		getModalStore,
		initializeStores,
		Modal
	} from '@skeletonlabs/skeleton';

	initializeStores();
	//const modalStore = getModalStore();

	let rowName;
	const sourceData = [
		{ eventName: 'testing', orgName: 'testOrg', loc: 'testLoc' },
		{ eventName: 'testing1', orgName: 'testOrg1', loc: 'testLoc1' },
		{ eventName: 'testing1', orgName: 'testOrg1', loc: 'testLoc1' },
		{ eventName: 'testing1', orgName: 'testOrg1', loc: 'testLoc1' },
		{ eventName: 'testing1', orgName: 'testOrg1', loc: 'testLoc1' },
		{ eventName: 'testing1', orgName: 'testOrg1', loc: 'testLoc1' },
		{ eventName: 'testing1', orgName: 'testOrg1', loc: 'testLoc1' },
		{ eventName: 'testing1', orgName: 'testOrg1', loc: 'testLoc1' },
		{ eventName: 'testing1', orgName: 'testOrg1', loc: 'testLoc1' }
	];

	const tableSimple = {
		head: ['Event', 'Organization', 'Location'],
		body: tableMapperValues(sourceData, ['eventName', 'orgName', 'loc'])
	};

	const modalStore = getModalStore();

	function selectedRow(meta) {
		const modal = {
			type: 'alert',
			// Data
			title: 'Example Alert',
			body: meta.detail[0]
		};

		modalStore.trigger(modal);
		console.log(meta.detail[0]);
	}
</script>

<div class="">
	<div class="mb-5">
		<h1 class="h1">Find Volunteer Oppurtinities</h1>
	</div>
	<div class="items-center">
		<Table source={tableSimple} interactive={true} on:selected={selectedRow} />
	</div>
	<Modal />
</div>
