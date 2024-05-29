<script>
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
	import ModalCreateSchedule from '../../../../../lib/component/modal/modalCreateSchedule.svelte';
	import ModalEditSchedule from '../../../../../lib/component/modal/modalEditSchedule.svelte';
	import ModalEditEvent from '../../../../../lib/component/modal/modalEditEvent.svelte';
	import { goto } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	import axiosInstance from '../../../../../lib/scripts/axiosInstance';
	import { DateTime } from 'luxon';
	//import { getCookie } from 'svelte-cookie';
	export let data;

	let token;
	const eventID = data.eventID;
	let eventDetail = '';
	let schedules = [];

	const toastStore = getToastStore();

	const toastScheduleCreatead = {
		message: 'Schedule has been created.',
		timeout: 3000
	};

	const toastScheduleDeleted = {
		message: 'Schedule has been deleted.',
		timeout: 3000
	};

	const toastScheduleUpdated = {
		message: 'Schedule has been updated.',
		timeout: 3000
	};

	const toastStatus = (message) => ({
		message: message,
		timeout: 3000
	});

	function getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop().split(';').shift();
	}

	onMount(async () => {
		token = getCookie('token');
		await fetchEventData();
		await fetchScheduleData();
		console.log(eventDetail);
	});

	onDestroy(async () => {});

	async function fetchEventData() {
		try {
			const resp = await axiosInstance.post(
				'/event/detail',
				{ eventID },
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);

			const data = resp.data;
			eventDetail = data.eventDetail;
		} catch (err) {
			console.error(err);
		}
	}

	async function fetchScheduleData() {
		try {
			const resp = await axiosInstance.post(
				'/schedule/list',
				{ eventID },
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);

			const data = resp.data;
			schedules = [...data.schedule];
			//console.log(schedules)
		} catch (err) {
			console.error(err);
		}
	}

	async function fetchScheduleDetail(scheduleID) {
		try {
			const resp = await axiosInstance.post(
				'/schedule/detail',
				{ scheduleID },
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);

			const data = resp.data;
			return data.schedule;
		} catch (err) {
			console.error(err);
		}
	}

	const modalStore = getModalStore();

	const modalCreate = async () => {
		const c = { ref: ModalCreateSchedule };
		const modal = {
			type: 'component',
			component: c,
			title: 'Create Schedule',
			meta: { eventID: eventDetail._id },
			body: 'Please enter schedule details',
			response: async (r) => {
				if (r) {
					try {
						const resp = await axiosInstance.post('/schedule/create', r, {
							headers: {
								Authorization: `Bearer ${token}`
							}
						});
						if (resp.data.success == true) {
							//toastStore.trigger(toastEventCreatead);
							await fetchScheduleData();
							console.log(schedules);
							toastStore.trigger(toastScheduleCreatead);
						}
					} catch (err) {}
				} else {
					await fetchScheduleData();
					console.log(schedules);
				}
			}
		};
		modalStore.trigger(modal);
	};

	async function modalCreateConfirmation(scheduleID) {
		const modal = {
			type: 'confirm',
			title: 'Remove Confirmation',
			body: 'Are you sure to delete this schedule.',
			response: async (r) => {
				if (r) {
					try {
						const resp = await axiosInstance.post(
							'/event/delete',
							{ scheduleID: scheduleID },
							{
								headers: {
									Authorization: `Bearer ${token}`
								}
							}
						);
						if (resp.data.success == true) {
							fetchScheduleData();
							toastStore.trigger(toastScheduleDeleted);
						}
					} catch (err) {}
				}
			}
		};
		modalStore.trigger(modal);
	}

	async function modalEditEvent() {
		const c = { ref: ModalEditEvent };
		const modal = {
			type: 'component',
			component: c,
			title: 'Edit Event',
			meta: {
				eventID,
				eventName: eventDetail.Name,
				description: eventDetail.Description,
				startDate: formatDateToInput(eventDetail.StartDate),
				endDate: formatDateToInput(eventDetail.EndDate),
				address: eventDetail.Address,
				country: eventDetail.Country
			},
			body: 'Please enter new event details',
			respose: async (r) => {
				console.log(r);
				if (r) {
					try {
						const resp = await axiosInstance.post('/event/edit', r, {
							headers: {
								Authorization: `Bearer ${token}`
							}
						});
						if (resp.data.success == true) {
							//toastStore.trigger(toastEventCreatead);
							await fetchEventData();
							toastStore.trigger(toastStatus('Event has been updated.'));
						}
					} catch (err) {}
				}
			}
		};
		modalStore.trigger(modal);
	}

	function formatDateToInput(date) {
		date = new Date(date);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
		const day = String(date.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
	}

	async function modalEdit(scheduleID) {
		const data = await fetchScheduleDetail(scheduleID);
		console.log(data);
		const c = { ref: ModalEditSchedule };
		const modal = {
			type: 'component',
			component: c,
			title: 'Edit Schedule',
			meta: {
				scheduleID,
				scheduleName: data.Name,
				description: data.Description,
				startTime: convertTimeInput(data.BeginAt),
				endTime: convertTimeInput(data.EndAt),
				maxVolunteer: data.MaxVolunteer
			},
			body: 'Please enter new schedule details',
			response: async (r) => {
				if (r) {
					try {
						const resp = await axiosInstance.post('/schedule/edit', r, {
							headers: {
								Authorization: `Bearer ${token}`
							}
						});
						if (resp.data.success == true) {
							//toastStore.trigger(toastEventCreatead);
							await fetchScheduleData();
							console.log(schedules);
							toastStore.trigger(toastScheduleUpdated);
						}
					} catch (err) {}
				} else {
					await fetchScheduleData();
					console.log(schedules);
				}
			}
		};
		modalStore.trigger(modal);
	}

	async function generateReport(eventID, type) {
		let urlReport;

		if (type == 0) {
			urlReport = `/report/generate/list/${eventID}`;
		} else if (type == 1) {
			urlReport = `/report/generate/attendance/${eventID}`;
		}
		try {
			const resp = await axiosInstance.get(urlReport, {
				responseType: 'arraybuffer',
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			const blob = new Blob([resp.data], { type: 'application/pdf' });
			const url = window.URL.createObjectURL(blob);

			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `Event_Report_${eventID}.pdf`);
			document.body.appendChild(link);
			link.click();
			link.remove();
		} catch (err) {
			console.error('Error downlaoding report', err);
		}
	}

	let isOpen = false;

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function handleClickOutside(event) {
		const dropdown = document.getElementById('dropdown');
		if (dropdown && !dropdown.contains(event.target)) {
			isOpen = false;
		}
	}

	// This function will be called when the component is clicked
	function handleComponentClick(event) {
		// If the click happened inside the dropdown, do nothing
		if (event.target.closest('.dropdown')) return;

		// Close the dropdown
		isOpen = false;
	}

	function isArrayEmpty(array) {
		return array.length === 0;
	}

	function convertTimeString(dateTime) {
		const time = DateTime.fromISO(dateTime);
		return time.toFormat('h:mm a');
	}

	function convertDateString(dateTime) {
		const date = DateTime.fromISO(dateTime);
		return date.toFormat('d LLLL y');
	}

	function convertTimeInput(dateTime) {
		const time = new Date(dateTime);
		const hours = time.getHours().toString().padStart(2, '0');
		const minutes = time.getMinutes().toString().padStart(2, '0');
		return hours + ':' + minutes;
	}
</script>

<main class="container mx-auto p-2">
	<h1 class="text-3xl font-bold mb-4">{eventDetail.Name}</h1>
	<div class="mb-4 space-y-1">
		<p class="">Description: {eventDetail.Description}</p>
		<p class="">Address: {eventDetail.Address}</p>
		<p class="">Country: {eventDetail.Country}</p>
		<p class="">Start Date: {convertDateString(eventDetail.StartDate)}</p>
		<p class="">End Date: {convertDateString(eventDetail.EndDate)}</p>
	</div>
	<div class="pt-4">
		<button type="button" class="btn variant-filled-primary" on:click={modalEditEvent}>Edit</button>
		<button type="button" class="btn variant-filled-primary" on:click={modalCreate}
			>Add Schedule</button
		>
		<button type="button" class="btn variant-filled-primary" on:click={toggleDropdown}
			>Generate Report</button
		>
		{#if isOpen}
			<div class="dropdown" id="dropdown" on:click={handleComponentClick}>
				<button on:click={() => generateReport(eventDetail._id, 0)}>Volunteer List</button><br>
				<button on:click={() => generateReport(eventDetail._id, 1)}>Attendance</button>
			</div>
		{/if}
	</div>
	<h2 class="text-2xl font-bold mb-4 pt-5">Schedule</h2>
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#if isArrayEmpty(schedules)}
			<p>No data available</p>
		{:else}
			{#each schedules as schedule (schedule._id)}
				<div class="p-6 shadow-md card variant-filled">
					<h3 class="text-xl font-semibold mb-2">{schedule.Name}</h3>
					<p class="">{schedule.Description}</p>
					<p class="">Begin: {convertTimeString(schedule.BeginAt)}</p>
					<p class="">End: {convertTimeString(schedule.EndAt)}</p>
					<p class="mt-5">{schedule.volunteerCount}/{schedule.MaxVolunteer} Volunteer</p>
					<div class="inline-block float-right mt-2">
						<button
							on:click={() => {
								goto('/organization/schedule/' + schedule._id + '/list');
							}}
							class="btn variant-filled-primary mb-2">View Volunteer</button
						>
						<button
							on:click={() => {
								goto('/organization/schedule/' + schedule._id + '/manual');
							}}
							class="btn variant-filled-primary mb-2">Attendance</button
						>
						<button class="btn variant-filled-primary" on:click={() => modalEdit(schedule._id)}
							>Edit</button
						>
						<button
							class="btn variant-filled-error"
							on:click={() => modalCreateConfirmation(schedule._id)}>Remove</button
						>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</main>

<style>
	
</style>
