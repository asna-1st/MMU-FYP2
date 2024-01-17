<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { slide, fade, fly } from 'svelte/transition';
	import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
	import { backIn, bounceIn } from 'svelte/easing';

	let cameras = [];
	let selectedCameraId;
	let html5QrCode;
	var lastResult,
		countResults = 0;
	let dataScan;
	let state = writable({ isScanning: false });
	let userID, scheduleID;
	let children = [{ username: 'testname', schedule: 'checkin' }];

	onMount(async () => {
		// Fetch available cameras
		cameras = await Html5Qrcode.getCameras();
	});

	const toggleScanning = () => {
		if ($state.isScanning) {
			stopScanning();
		} else {
			startScanning();
		}
	};

	const startScanning = () => {
		//children.unshift({username: "testname" ,type: 1})
		console.log(children);
		if (selectedCameraId) {
			html5QrCode = new Html5Qrcode('scanner');

			html5QrCode
				.start(
					selectedCameraId,
					{
						fps: 30,
						qrbox: { width: 300, height: 300 },
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
			state.set({ isScanning: true });
		}
	};

	function onScanSuccess(decodedText, decodedResult) {
		// handle the scanned code as you like, for example:
		if (decodedText !== lastResult) {
			++countResults;
			lastResult = decodedText;
			// Handle on success condition with the decoded message.
			//console.log(`Scan result ${decodedText}`, decodedResult);
			decodeQR(decodedText).then((data) => {
				children.unshift({ username: data.user_id, schedule: data.schedule_id });
				children = children;
				if (children.length === 5) {
					children.pop();
				}
				//userID = data.user_id;
				//scheduleID = data.schedule_id;
			});
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
				state.set({ isScanning: false });
			});
		}
	};
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
				{#if $state.isScanning}
					Stop Scanning
				{:else}
					Start Scanning
				{/if}
			</button>
		</div>
	</div>
	<div class="mt-5">
		<div class="parent" transition:fade>
			{#each children.slice(0, 5) as child (child)}
				<div class="child" transition:fly={{ duration: 800, x: -100 }}>
					<div class="card variant-filled w-full p-4 mt-1 flow-root" style="width: 500px">
						<p class="float-left">{child.username}</p>  <p class="float-right"><span class="font-bold">Status: </span> {child.schedule}</p>
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
		width: 300px;
		height: 300px;
		position: relative;
		overflow: hidden;
		border-radius: 5px;
	}
</style>
