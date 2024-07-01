<script>
	import { onMount } from 'svelte';
	import { getToastStore, getModalStore } from '@skeletonlabs/skeleton';
	import { writable } from 'svelte/store';
	import QRCode from 'qrcode';
	import axiosInstance from '../../../../../lib/scripts/axiosInstance.js';
	import io from 'socket.io-client';
	import ModalAttendanceStatus from '../../../../../lib/component/modal/modalAttendanceStatus.svelte';
	import LoadingScreen from '../../../../../lib/component/LoadingScreen.svelte';
	import utils from '../../../../../lib/scripts/utils.js';
	export let data;

	const volScheduleID = data.volScheduleID;
	let scheduleData = null;
	let canvas;
	let token;
	let statusData;
	let attStatus;
	const loading = writable(true);

	const socket = io(import.meta.env.VITE_BACKEND_URL);

	const toastStore = getToastStore();
	const modalStore = getModalStore();

	const toastStatus = (message) => ({
		message: message,
		timeout: 3000
	});

	function initSocket() {
		socket.emit('joinAtt', volScheduleID)
	}

	socket.on('attendance', (data) => {
		statusData = data;
		//console.log(statusData);
		
		if (statusData.volStatus === "checked-in") {
			toastStore.trigger(toastStatus("Check-In successful."));
			fetchAttStatus();
		} else if (statusData.volStatus === "checked-out") {
			toastStore.trigger(toastStatus("Check-Out successful."));
			fetchAttStatus();
		}
	})

	onMount(async () => {
		token = utils.getToken();
		await fetchScheduleData();
		await generateQR(volScheduleID, scheduleData.eventStartDate, scheduleData.eventEndDate);
		await fetchAttStatus();
		initSocket();
		loading.set(false);
	});

	async function generateQR(volScheduleID, beginDate, endDate) {
		try {
			const resp = await axiosInstance.post(
				'/generateQR',
				{ volScheduleID, beginDate, endDate },
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);

			const data = resp.data;
			//console.log(data);
			QRCode.toCanvas(canvas, data, { errorCorrectionLevel: 'L', width: 300 }, (error) => {
				if (error) {
					console.error(error);
				} else {
					//console.log('QRCode generated');
				}
			});
		} catch (err) {
			console.error(err);
		}
	};

	async function fetchAttStatus() {
		try {
			const resp = await axiosInstance.post(
				'/attendance/check',
				{ volScheduleID },
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);

			const data = resp.data;
			const checkedIn = data.checkedIn;
			const checkedOut = data.checkedOut;
			
			if (checkedIn == true && checkedOut == false) {
				attStatus = "In Progress";
			} else if (checkedIn == true && checkedOut == true) {
				attStatus = "Complete For Today";
			} else {
				attStatus = "Not Check-In";
			}
			//console.log(data);
		} catch (err) {
			console.error(err);
		}
	}

	async function fetchScheduleData() {
		try {
			const resp = await axiosInstance.post(
				'/attendance/detail',
				{ volScheduleID },
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);

			const data = resp.data;
			scheduleData = data.eventData;
			//console.log(scheduleData);
		} catch (err) {
			console.error(err);
		}
	}

	const modalAttendance = async () => {
		const c = { ref: ModalAttendanceStatus };
		const modal = {
			type: 'component',
			component: c,
			title: 'Attendance Status',
			meta: {
				volScheduleID
			},
			body: 'List of attendance',
		};
		modalStore.trigger(modal);
	};
</script>

<LoadingScreen {loading}/>
<div class="flex flex-col justify-center items-center min-h-screen p-4 sm:p-6 md:p-10 space-y-6">
	<div class="text-center space-y-6 rounded-lg w-full max-w-sm">
		<p class="text-xl font-bold pt-6">QR Attendance</p>
		<div class="card">
			<div class="p-6 flex justify-center items-center">
				<div class="max-w-xs">
					<canvas id="canvas" bind:this={canvas}></canvas>
				</div>
			</div>
		</div>
	</div>
	<div class="card text-left px-6 w-full max-w-lg shadow-lg rounded-lg">
		<div class="mt-3 space-y-4">
			{#if scheduleData}
				<div class="grid grid-cols-2 gap-4 p-6">
					<p class="font-semibold">Event:</p><p>{scheduleData.eventName}</p>
					<p class="font-semibold">Schedule:</p><p>{scheduleData.scheduleName}</p>
					<p class="font-semibold">Date:</p><p class="md:whitespace-nowrap">{utils.formatDateToInput(scheduleData.eventStartDate)} - {utils.formatDateToInput(scheduleData.eventEndDate)}</p>
					<p class="font-semibold">Begin:</p><p>{utils.convertTimeInput(scheduleData.scheduleBeginAt)}</p>
					<p class="font-semibold">End:</p><p>{utils.convertTimeInput(scheduleData.scheduleEndAt)}</p>
					<p class="font-semibold">Status:</p><p>{attStatus}</p>
				</div>
				<div class="px-6 pb-6">
					<button type="button" class="btn variant-filled-primary w-full" on:click={modalAttendance}>Attendance Status</button>
				</div>
			{:else}
				<p class="p-6">Loading...</p>
			{/if}
		</div>
	</div>
</div>
