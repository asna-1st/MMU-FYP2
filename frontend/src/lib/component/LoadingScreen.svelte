<script>
    import { fly, fade } from 'svelte/transition';
    import { readable } from 'svelte/store';
    export let loading = false;

    //console.log(loading)
</script>

<style>
    .loading-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgb(243, 243, 243);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .spinner {
        border: 8px solid #f3f3f3;
        border-top: 8px solid #3498db;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        animation: spin 2s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>

{#if $loading}
    <div class="loading-screen" in:fly={{ y: 200, duration: 300 }} out:fade={{ duration: 300 }}>
        <div class="spinner"></div>
    </div>
{/if}
