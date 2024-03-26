<!-- <script>
    import { getModalStore } from '@skeletonlabs/skeleton';

    export let parent;

    const modalStore = getModalStore();

    const formData = {
        eventName: '',
        description: '',
        startDate: '',
        endDate: '',
        address: '',
        country: ''
    }

    function onFormSubmit() {
        if ($modalStore[0].response) $modalStore[0].response(formData);
        modalStore.close();
    }

    const cBase = 'card p-4 w-modal shadow-xl space-y-4';
    const cHeader = 'text-2xl font-bold';
    const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';
</script>

{#if $modalStore[0]}
    <div class="modal-example-form {cBase}">
        <header class="{cHeader}">{$modalStore[0].title ?? '(title missing)'}</header>
        <article>{$modalStore[0].body ?? '(body missing)'}</article>
        <form class="modal-form {cForm}">
            <label class="label">
                <span>Event Name</span>
                <input class="input" type="text" bind:value={formData.eventName} required/>
            </label>
            <label class="label">
                <span>Description</span>
                <textarea class="textarea" rows="3" bind:value={formData.description} required/>
            </label>
            <label class="label">
                <span>Start Date</span>
                <input class="input" type="date" bind:value={formData.startDate} required/>
            </label>
            <label class="label">
                <span>End Date</span>
                <input class="input" type="date" bind:value={formData.endDate} required/>
            </label>
            <label class="label">
                <span>Address</span>
                <textarea class="textarea" rows="4" bind:value={formData.address} required/>
            </label>
            <label class="label">
                <span>Country</span>
                <select class="select" bind:value={formData.country} required>
                    <option value="1">Malaysia</option>
                </select>
            </label>
        </form>

        <footer class="modal-footer {parent.regionFooter}">
            <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
            <button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Create</button>
        </footer>
    </div>
{/if} -->

<script>
    import { getModalStore } from '@skeletonlabs/skeleton';

    export let parent;

    const modalStore = getModalStore();

    const formData = {
        eventName: '',
        description: '',
        startDate: '',
        endDate: '',
        address: '',
        country: ''
    }

    let today = new Date().toISOString().split('T')[0];
    let errors = {};

    function validateForm() {
        errors = {};

        if (!formData.eventName.trim()) {
            errors.eventName = "Event name is required";
        }

        if (!formData.description.trim()) {
            errors.description = "Description is required";
        }

        if (!formData.startDate) {
            errors.startDate = "Start date is required";
        }

        if (!formData.endDate) {
            errors.endDate = "End date is required";
        }

        if (!formData.address.trim()) {
            errors.address = "Address is required";
        }

        if (!formData.country) {
            errors.country = "Country is required";
        }

        return Object.keys(errors).length === 0;
    }

    function onFormSubmit() {
        const isValid = validateForm();
        if (isValid) {
            if ($modalStore[0].response) $modalStore[0].response(formData);
            modalStore.close();
        }
    }

    const cBase = 'card p-4 w-modal shadow-xl space-y-4';
    const cHeader = 'text-2xl font-bold';
    const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';
</script>

{#if $modalStore[0]}
    <div class="modal-example-form {cBase}">
        <header class="{cHeader}">{$modalStore[0].title ?? '(title missing)'}</header>
        <article>{$modalStore[0].body ?? '(body missing)'}</article>
        <form class="modal-form {cForm}">
            <label class="label">
                <span>Event Name</span>
                <input class="input" type="text" bind:value={formData.eventName} required/>
                {#if errors.eventName}<p class="error">{errors.eventName}</p>{/if}
            </label>
            <label class="label">
                <span>Description</span>
                <textarea class="textarea" rows="3" bind:value={formData.description} required/>
                {#if errors.description}<p class="error">{errors.description}</p>{/if}
            </label>
            <label class="label">
                <span>Start Date</span>
                <input class="input" type="date" bind:value={formData.startDate} min={today} required/>
                {#if errors.startDate}<p class="error">{errors.startDate}</p>{/if}
            </label>
            <label class="label">
                <span>End Date</span>
                <input class="input" type="date" bind:value={formData.endDate} min={today} required/>
                {#if errors.endDate}<p class="error">{errors.endDate}</p>{/if}
            </label>
            <label class="label">
                <span>Address</span>
                <textarea class="textarea" rows="4" bind:value={formData.address} required/>
                {#if errors.address}<p class="error">{errors.address}</p>{/if}
            </label>
            <label class="label">
                <span>Country</span>
                <select class="select" bind:value={formData.country} required>
                    <option value="1">Malaysia</option>
                </select>
                {#if errors.country}<p class="error">{errors.country}</p>{/if}
            </label>
        </form>

        <footer class="modal-footer {parent.regionFooter}">
            <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
            <button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Create</button>
        </footer>
    </div>
{/if}
