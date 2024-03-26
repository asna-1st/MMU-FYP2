<script>
	import '../../app.postcss';
	import { AppShell, AppBar, initializeStores, Modal} from '@skeletonlabs/skeleton';

	initializeStores();
</script>
<style>
	
</style>
<!-- App Shell -->
<Modal />
<AppShell>
	<!-- Page Route Content -->
	<slot />
</AppShell>

