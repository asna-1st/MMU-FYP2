<script>
	import '../../app.postcss';
	import { AppShell, AppBar, initializeStores, Modal, Toast} from '@skeletonlabs/skeleton';

	initializeStores();
</script>
<style>
	
</style>
<!-- App Shell -->
<Modal />
<Toast />
<AppShell>
	<!-- Page Route Content -->
	<slot />
</AppShell>

