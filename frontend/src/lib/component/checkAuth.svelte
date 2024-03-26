<script>
    import {onMount} from 'svelte';
    import {getCookie} from 'svelte-cookie';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';

    const currentPath = $page.url.pathname;
    
    onMount(() => {
        const token = getCookie('token');
        const userType = getCookie('userType');
        if (!token) {
            goto('/');
        } else {
            if (currentPath.includes("organization") == true && userType == '1') {
                goto('/dashboard/volunteer');
            } else if (currentPath.includes("volunteer") == true && userType == '0') {
                goto('/dashboard/organization');
            }
        }
    });
</script>