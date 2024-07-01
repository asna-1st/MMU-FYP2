<script>
	import QrScanner from 'qr-scanner';
	import { onMount, onDestroy } from 'svelte';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import axiosInstance from '../scripts/axiosInstance';
	//import { fade, fly } from 'svelte/transition';
	import utils from '../scripts/utils';

	let cameraList = [];
	let volunteerStatus = [];
	let selectedCameraId;
	let state = false;
	let lastResult,
		countResults = 0;
	let videoScanner;
	let qrScanner;
	let qrHighlight;
	let token;

	const toastStore = getToastStore();

	const toastStatus = (message) => ({
		message: message,
		timeout: 3000
	});

	onMount(async () => {
		token = utils.getToken();
		try {
			cameraList = await QrScanner.listCameras(true);
			//console.log(cameraList);
			if (cameraList.length > 0) {
				selectedCameraId = cameraList[0].id;
			} else {
				console.error('No cameras found.');
			}
		} catch (error) {
			console.error('Error initializing cameras:', error);
		}
	});

	const toggleScanning = async () => {
		if (state) {
			stopScanning();
		} else {
			await startScanning();
		}
	};

	const onScanSuccess = (result) => {
		if (result.data !== lastResult) {
			++countResults;
			lastResult = result.data;
			//console.log(result.data);
			attendance(result.data);
		}
	};
	const startScanning = async () => {
		if (selectedCameraId) {
			try {
				qrScanner = new QrScanner(videoScanner, onScanSuccess, {
					highlightCodeOutline: true,
					returnDetailedScanResult: true,
					overlay: qrHighlight
				});
				await qrScanner.setCamera(selectedCameraId);
				qrScanner.start();
				state = true;
			} catch (error) {
				console.error('Error starting QR scanner:', error);
			}
		} else {
			console.error('No camera selected or QR scanner not initialized.');
		}
	};

	const stopScanning = () => {
		if (qrScanner) {
			qrScanner.stop();
			qrScanner.destroy();
			qrScanner = null;
			state = false;
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
			//console.log(data);
			//console.log(data.message);
			volunteerStatus.unshift({ volName: data.volName, attStatus: data.attStatus });
			volunteerStatus = volunteerStatus;
			if (volunteerStatus.length === 5) {
				volunteerStatus.pop();
			}
			//console.log(volunteerStatus);
			toastStore.trigger(toastStatus(data.message));
		} catch (err) {
			console.error(err);
			if (err.response.status == 400) {
				//console.log(err.response.data);
				toastStore.trigger(toastStatus(err.response.data.message));
			}
		}
	}

	onDestroy(async () => {});
</script>

<div class="flex flex-col items-center justify-center pt-10">
	<div class="space-y-6">
		<div class="card bg-initial p-4">
			<div class="video-container">
				<!-- svelte-ignore a11y-media-has-caption -->
				<video id="qr-video" bind:this={videoScanner}></video>
				<div bind:this={qrHighlight} class="code-outline-highlight"></div>
			</div>
		</div>
		<div class="form space-y-4 text-center">
			<label class="label">
				<span>Select Camera: </span>
				<select bind:value={selectedCameraId} class="select">
					{#each cameraList as camera}
						<option value={camera.id}>{camera.label}</option>
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
		<div class="parent">
			{#each volunteerStatus.slice(0, 5) as child (child)}
				<div class="child card-wrapper">
					<div class="card variant-filled w-full p-4 mt-1 flow-root" style="width: 500px">
						<p class="float-left">{child.volName}</p>
						<p class="float-right"><span class="font-bold">Status: </span> {child.attStatus}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.video-container {
		width: 400px;
		height: 400px;
		overflow: hidden;
	}

	#qr-video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.code-outline-highlight {
		stroke: #64a2f3 !important;
	}

	@media screen and (max-width: 600px) {
		.video-container {
			max-width: 300px;
			max-height: 300px;
		}
	}

	@keyframes fly-in {
		from {
			transform: translateX(-100px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.parent .child {
		animation: fly-in 0.8s ease forwards;
		opacity: 0;
	}
</style>
