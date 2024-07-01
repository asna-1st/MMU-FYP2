<script>
	import { onMount, onDestroy } from 'svelte';
	import QRCode from 'qrcode';

	let schedule_id;
	let user_id;
	let canvas;
    let qrToken;


	const generateQR = async () => {
        const response = await fetch('http://localhost:8083/generateQR', {
           method: 'POST',
           mode: 'cors',
           headers: {
            'Content-Type': 'application/json'
           },
           body: JSON.stringify({user_id, schedule_id})
        });

        console.log(JSON.stringify({user_id, schedule_id}));
        const data = await response.json();

		if (canvas) {
			canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
		}

		QRCode.toCanvas(canvas, data, { errorCorrectionLevel: 'M', width: 300}, (error) => {
			if (error) {
				console.error(error);
			} else {
				console.log('QRCode generated');
			}
		});
	};
</script>

<style>
    #canvas {
        width: 300px;
        height: 300px;
    }
</style>

<div class="flex justify-center items-center">
	<div class="text-center space-y-6 pt-20 rounded-none -max-ww-full md:max-w-md">
		<div>
			<canvas id="canvas" bind:this={canvas}></canvas>
		</div>
		<div class="space-y-4">
			<label class="label">
				<span>Schedule ID:</span>
				<input type="text" bind:value={schedule_id} class="input mt-1"/>
			</label>
			<label class="label">
				<span>User ID:</span>
				<input type="text" bind:value={user_id} class="input mt-1"/>
			</label>
			<button class="btn variant-filled" on:click={generateQR}>Generate</button>
		</div>
	</div>

</div>