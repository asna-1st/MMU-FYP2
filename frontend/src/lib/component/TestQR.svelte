<script>
	import { onDestroy, onMount } from 'svelte';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { writable } from 'svelte/store';
	import { slide, fade, fly } from 'svelte/transition';
	import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
	import { backIn, bounceIn } from 'svelte/easing';
	import axiosInstance from '../scripts/axiosInstance';

	let cameras = [];
	let selectedCameraId;
	let html5QrCode;
	var lastResult,
		countResults = 0;
	let state = false;
	let token;
	let volunteerStatus = [];

	const toastStore = getToastStore();

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
		// Fetch available cameras
		//Temp disable
		token = getCookie('token');
		cameras = await Html5Qrcode.getCameras();
	});

	const toggleScanning = () => {
		if (state == true) {
			stopScanning();
		} else {
			startScanning();
		}
	};

	const startScanning = () => {
		if (selectedCameraId) {
			html5QrCode = new Html5Qrcode('scanner');

			html5QrCode
				.start(
					selectedCameraId,
					{
						fps: 30,
						qrbox: { width: 500, height: 500 },
						formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
					},
					onScanSuccess,
					onScanFailure
				)
				.catch((err) => {
					// Handle start failure
					console.error(err);
				});

			const observer = new MutationObserver((mutationsList) => {
				for (const mutation of mutationsList) {
					if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
						// Apply styles to the added video element
						const videoElement = mutation.addedNodes[0];
						videoElement.style.width = '100%';
						videoElement.style.height = '100%';
						videoElement.style.objectFit = 'cover';

						// Disconnect the observer once styles are applied
						observer.disconnect();
					}
				}
			});

			observer.observe(document.getElementById('scanner'), { childList: true, subtree: true });
			state = true;
		}
	};

	function onScanSuccess(decodedText, decodedResult) {
		// handle the scanned code as you like, for example:
		if (decodedText !== lastResult) {
			++countResults;
			lastResult = decodedText;
			// Handle on success condition with the decoded message.
			console.log(`Scan result ${decodedText}`, decodedResult);
			// decodeQR(decodedText).then((data) => {
			// 	children.unshift({ username: data.user_id, schedule: data.schedule_id });
			// 	children = children;
			// 	if (children.length === 5) {
			// 		children.pop();
			// 	}
			attendance(decodedText);
			//userID = data.user_id;
			//scheduleID = data.schedule_id;
		}
	}

	const decodeQR = async (token) => {
		const response = await fetch('http://localhost:8083/decodeQR', {
			method: 'POST',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ token }) // You can replace this with actual data
		});

		return await response.json();
	};

	function onScanFailure(error) {
		// handle scan failure, usually better to ignore and keep scanning.
		// for example:
		console.warn(`Code scan error = ${error}`);
	}

	const stopScanning = () => {
		if (html5QrCode) {
			html5QrCode.stop().then(() => {
				console.log('Scanning stopped');
				state = false;
				html5QrCode.clear();
				html5QrCode = null;
				lastResult = null;
				countResults = 0;
			});
		}
	};

	async function attendance(volScheduleToken) {
		try {
			const resp = await axiosInstance.post(
				'/attendance',
				{ volScheduleToken },
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);

			const data = resp.data;
			console.log(data);
			console.log(data.message);
			volunteerStatus.unshift({ volName: data.volName, attStatus: data.attStatus });
			volunteerStatus = volunteerStatus;
			if (volunteerStatus.length === 5) {
				volunteerStatus.pop();
			}
			console.log(volunteerStatus);
			toastStore.trigger(toastStatus(data.message));
		} catch (err) {
			console.error(err);
			if (err.response.status == 400) {
				console.log(err.response.data);
				toastStore.trigger(toastStatus(err.response.data.message));
			}
		}
	}

	onDestroy(async () => {
		html5QrCode.clear();
		html5QrCode = null;
		lastResult = null;
		countResults = 0;
	});
</script>

<div class="flex flex-col items-center justify-center pt-10">
	<div class="space-y-6">
		<div class="card bg-initial p-4">
			<div id="scanner" class="scanner"></div>
		</div>
		<div class="form space-y-4 text-center">
			<label class="label">
				<span>Select Camera: </span>
				<select bind:value={selectedCameraId} class="select">
					{#each cameras as camera (camera.id)}
						<option value={camera.id}>{camera.label || `Camera ${camera.id}`}</option>
					{/each}
				</select>
			</label>
			<button on:click={toggleScanning} class="btn variant-filled">
				{#if state == true}
					Stop Scanning
				{:else}
					Start Scanning
				{/if}
			</button>
		</div>
	</div>
	<div class="mt-5">
		<div class="parent" transition:fade>
			{#each volunteerStatus.slice(0, 5) as child (child)}
				<div class="child" transition:fly={{ duration: 800, x: -100 }}>
					<div class="card variant-filled w-full p-4 mt-1 flow-root" style="width: 500px">
						<p class="float-left">{child.volName}</p>
						<p class="float-right"><span class="font-bold">Status: </span> {child.attStatus}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<!-- <div class="container mt-5">
	<label for="cameraSelect" class="form-label">Select Camera:</label>
	<select id="cameraSelect" bind:value={selectedCameraId} class="form-select mb-3" width="100px">
		{#each cameras as camera (camera.id)}
			<option value={camera.id}>{camera.label || `Camera ${camera.id}`}</option>
		{/each}
	</select>

	<button on:click={toggleScanning} class="btn btn-primary me-2">
		{#if $state.isScanning}
			Stop Scanning
		{:else}
			Start Scanning
		{/if}
	</button>

	<div id="scanner" class="scanner"></div>
	<p>{userID}</p><br>
	<p>{scheduleID}</p>
</div> -->

<style>
	/* Add your custom styles here */

	#scanner {
		width: 500px;
		height: 500px;
		position: relative;
		overflow: hidden;
		border-radius: 5px;
	}
</style>
