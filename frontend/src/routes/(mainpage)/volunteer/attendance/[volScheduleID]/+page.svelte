<script>
	import { onMount, onDestroy } from 'svelte';
	import { getToastStore, getModalStore } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import QRCode from 'qrcode';
	import axiosInstance from '../../../../../lib/scripts/axiosInstance.js';
	import io from 'socket.io-client';
	import ModalAttendanceStatus from '../../../../../lib/component/modal/modalAttendanceStatus.svelte';
	export let data;

	const volScheduleID = data.volScheduleID;
	let scheduleData = null;
	let canvas;
	let token;
	let statusData;

	const socket = io('http://localhost:8083');

	const toastStore = getToastStore();
	const modalStore = getModalStore();

	const toastStatus = (message) => ({
		message: message,
		timeout: 3000
	});

	function getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop().split(';').shift();
	}

	function initSocket() {
		socket.emit('joinAtt', volScheduleID)
	}

	socket.on('attendance', (data) => {
		statusData = data;
		console.log(statusData);
		
		if (statusData.volStatus === "checked-in") {
			toastStore.trigger(toastStatus("Check-In successful."));
		} else if (statusData.volStatus === "checked-out") {
			toastStore.trigger(toastStatus("Check-Out successful."));
		}
	})

	onMount(async () => {
		token = getCookie('token');
		initSocket()
		await fetchScheduleData();
		await generateQR(volScheduleID, scheduleData.eventStartDate, scheduleData.eventEndDate);
	});

	async function generateQR(volScheduleID, beginDate, endDate) {
		// const response = await fetch('http://localhost:8083/generateQR', {
		//    method: 'POST',
		//    mode: 'cors',
		//    headers: {
		//     'Content-Type': 'application/json'
		//    },
		//    body: JSON.stringify({user_id, schedule_id})
		// });

		// console.log(JSON.stringify({user_id, schedule_id}));
		// const data = await response.json();

		// // Clear the existing canvas
		// if (canvas) {
		// 	canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
		// }
		// // Create a new canvas
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
			console.log(data);
			QRCode.toCanvas(canvas, data, { errorCorrectionLevel: 'L', width: 300 }, (error) => {
				if (error) {
					console.error(error);
				} else {
					console.log('QRCode generated');
				}
			});
		} catch (err) {
			console.error(err);
		}
	};

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
			console.log(scheduleData);
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

<div class="flex justify-center items-center">
	<div class="text-center space-y-6 pt-20 rounded-none -max-ww-full md:max-w-md">
		<p class="text-xl font-semibold">QR Attendance</p>
		<div class="card">
			<div class="p-6">
				<canvas id="canvas" bind:this={canvas}></canvas>
			</div>
		</div>
		<div class="mt-3 space-y-1 text-center">
			{#if scheduleData}
				<p>Event: {scheduleData.eventName}</p>
				<p>Job: {scheduleData.scheduleName}</p>
				<p>Date: {scheduleData.eventStartDate} - {scheduleData.eventEndDate}</p>
				<p>Begin: {scheduleData.scheduleBeginAt}</p>
				<p>End: {scheduleData.scheduleEndAt}</p>
				<p>Status: Not Check-In</p>
				<button type="button" class="btn variant-filled-primary w-full" on:click={modalAttendance}>Attendance Status</button>
			{:else}
				<p>Loading...</p>
			{/if}
		</div>
	</div>
</div>

<!-- <div>
	<canvas id="canvas" bind:this={canvas}></canvas>
	<div>
		<label>Schedule ID:</label>
		<input type="text" bind:value={schedule_id} /><br />
		<label>User ID:</label>
		<input type="text" bind:value={user_id} />
		<button
			type="button"
			on:click={generateQR}>Generate</button
		>
	</div>
</div>
 -->

<style>
	#canvas {
		width: 300px;
		height: 300px;
	}
</style>
