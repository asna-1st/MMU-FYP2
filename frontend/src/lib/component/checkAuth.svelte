<script>
    import {onMount} from 'svelte';
    import {getCookie} from 'svelte-cookie';
    import { goto } from '$app/navigation';
    
    onMount(() => {
        const token = getCookie('token');
        if (!token) {
            goto('/auth/signin/volunteer');
        }
    });
</script>