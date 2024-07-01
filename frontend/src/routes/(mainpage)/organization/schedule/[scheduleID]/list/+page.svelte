<script>
    import { onDestroy, onMount } from 'svelte';
    import { writable, derived } from 'svelte/store';
    import axiosInstance from '../../../../../../lib/scripts/axiosInstance.js';
    import LoadingScreen from '../../../../../../lib/component/LoadingScreen.svelte';
    import utils from '../../../../../../lib/scripts/utils.js';
	import '@fortawesome/fontawesome-free/css/all.min.css';

    export let data;

    let token;
    const scheduleID = data.scheduleID;
    //console.log(scheduleID);
    const loading = writable(true);
    let volunteers = writable([]);
    const searchQuery = writable('');
    const currentPage = writable(0);
    const recordsPerPage = 10;

    async function fetchVolunteerData() {
        try {
            const resp = await axiosInstance.post(
                '/schedule/volunteer/list',
                { scheduleID },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = resp.data;
            volunteers.set(data.volunteerList);
            //console.log(data.volunteerList);
        } catch (err) {
            console.error(err);
        }
    }

    async function removeVolunteer(volunteerID, scheduleID) {
        try {
            const resp = await axiosInstance.post(
                '/schedule/remove',
                { volunteerID, scheduleID },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (resp.data.success == true) {
                await fetchVolunteerData();
            }
        } catch (err) {}
    }

    onMount(async () => {
        token = utils.getToken();
        await fetchVolunteerData();
        loading.set(false);
    });

    const filteredVolunteers = derived([volunteers, searchQuery], ([$volunteers, $searchQuery]) => {
        if (!$searchQuery) return $volunteers;
        return $volunteers.filter(
            (volunteer) =>
                volunteer.Name.toLowerCase().includes($searchQuery.toLowerCase()) ||
                volunteer.Email.toLowerCase().includes($searchQuery.toLowerCase())
        );
    });

    $: totalPages = Math.ceil($filteredVolunteers.length / recordsPerPage);
    $: paginatedVolunteers = $filteredVolunteers.slice(
        $currentPage * recordsPerPage,
        ($currentPage + 1) * recordsPerPage
    );

    function nextPage() {
        if ($currentPage < totalPages - 1) {
            currentPage.update((n) => n + 1);
        }
    }

    function prevPage() {
        if ($currentPage > 0) {
            currentPage.update((n) => n - 1);
        }
    }
</script>

<LoadingScreen {loading}/>
<main class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Volunteer List</h1>
    <div class="flex flex-col md:flex-row items-center justify-between mb-4">
        <div class="flex flex-col md:flex-row">
            <input
                type="text"
                placeholder="Search by name or email"
                class="input"
                bind:value={$searchQuery}
            />
        </div>
    </div>
    {#if $volunteers.length === 0}
        <p>No volunteers registered for this event.</p>
    {:else}
        <div class="table-container mb-4 overflow-x-auto">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {#each paginatedVolunteers as volunteer (volunteer._id)}
                        <tr>
                            <td>{volunteer.Name}</td>
                            <td>{volunteer.Email}</td>
                            <td>
                                <button
                                    class="btn btn-sm remove-button variant-filled-error"
                                    on:click={() => removeVolunteer(volunteer._id, scheduleID)}
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        <div class="flex items-center justify-center">
            <button
                class="pagination-btn pagination-btn-prev variant-filled"
                on:click={prevPage}
                disabled={$currentPage === 0}
            >
                <i class="fa-solid fa-chevron-left"></i>
            </button>
            <p class="pagination-info variant-filled">
                {$currentPage + 1} of {totalPages}
            </p>
            <button
                class="pagination-btn pagination-btn-next variant-filled"
                on:click={nextPage}
                disabled={$currentPage >= totalPages - 1}
            >
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        </div>
    {/if}
</main>

<style>
    .remove-button {
        background-color: #ff4c4c;
        color: #fff;
    }

    .pagination-btn {
        border: none;
        padding: 8px 16px;
        border-radius: 0;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .pagination-btn:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }

    .pagination-btn-prev {
        border-top-left-radius: 40px;
        border-bottom-left-radius: 40px;
    }

    .pagination-btn-next {
        border-top-right-radius: 40px;
        border-bottom-right-radius: 40px;
    }

    .pagination-info {
        padding: 8px 16px;
    }

    .pagination-btn:not(:disabled) + .pagination-info {
        border-left: 1px solid #353635;
    }

    .pagination-info + .pagination-btn:not(:disabled) {
        border-left: 1px solid #353635;
    }
</style>
