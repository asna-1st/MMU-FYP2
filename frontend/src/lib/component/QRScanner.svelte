<!-- QRScanner.svelte -->

<script>
	import { onMount, onDestroy } from 'svelte';
	import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

	let scanner;
	var lastResult, countResults = 0;

	onMount(() => {
		scanner = new Html5QrcodeScanner(
			'elemenrt',
			{
				fps: 30,
				qrbox: { width: 400, height: 400 },
				formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
			},
			/* verbose= */ false
		);
		scanner.render(onScanSuccess, onScanFailure);
	});

	onDestroy(() => {
		if (scanner) {
			scanner.stop();
		}
	});

	function onScanSuccess(decodedText, decodedResult) {
		if (decodedText !== lastResult) {
			++countResults;
			lastResult = decodedText;
			// Handle on success condition with the decoded message.
			console.log(`Scan result ${decodedText}`, decodedResult);
		}
	}

	function onScanFailure(error) {
		// handle scan failure, usually better to ignore and keep scanning.
		// for example:
		console.warn(`Code scan error = ${error}`);
	}
</script>

<div id="elemenrt" width="600px" height="600px"></div>

<style>
	#elemenrt {
		width: 600px;
		height: 600px;
	}
</style>
