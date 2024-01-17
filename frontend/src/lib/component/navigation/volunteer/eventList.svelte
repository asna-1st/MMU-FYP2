<script>
	import { Table } from '@skeletonlabs/skeleton';
	import {tableMapperValues} from '@skeletonlabs/skeleton';
	const sourceData = [
		{eventName: "testing", orgName: "testOrg", loc: "testLoc"},
		{eventName: "testing1", orgName: "testOrg1", loc: "testLoc1"},
		{eventName: "testing1", orgName: "testOrg1", loc: "testLoc1"},
		{eventName: "testing1", orgName: "testOrg1", loc: "testLoc1"},
		{eventName: "testing1", orgName: "testOrg1", loc: "testLoc1"},
		{eventName: "testing1", orgName: "testOrg1", loc: "testLoc1"},
		{eventName: "testing1", orgName: "testOrg1", loc: "testLoc1"},
		{eventName: "testing1", orgName: "testOrg1", loc: "testLoc1"},
		{eventName: "testing1", orgName: "testOrg1", loc: "testLoc1"},
	]

	const tableSimple = {
		head: ["Event", "Organization", "Location"],
		body: tableMapperValues(sourceData, ["eventName", "orgName", "loc"])
	}
</script>

<div class="">
	<div class="mb-5">
		<h1 class="h1">Find Volunteer Oppurtinities</h1>
	</div>
	<div class="items-center">
		<Table source={tableSimple}/>
	</div>
</div>