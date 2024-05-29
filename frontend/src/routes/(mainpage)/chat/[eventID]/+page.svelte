<script>
	import { onMount, setContext } from 'svelte';
	import io from 'socket.io-client';
    import axiosInstance from '../../../../lib/scripts/axiosInstance.js';
	export let data;

	let socket;
    let token;
	const eventID = data.eventID;
	let messages = [];
	let messageInput;
    let userDetail, eventDetail = "Loading...";

	function sendMessage(message) {
		socket.emit('sendMessage', {
			eventID,
			userID: userDetail._id,
			userType: userDetail.userType,
			message
		});
        messageInput = '';
	}

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

    async function fetchUserDetail() {
		try {
			const resp = await axiosInstance.post(`/user/detail`, null, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			userDetail = resp.data.userDetail;
			console.log(userDetail);
		} catch (err) {
			console.error('Error fetching data:', err);
		}
	}

	onMount(async () => {
        token = getCookie('token');
        await fetchUserDetail();
        await fetchEventData();
		socket = io('http://localhost:8083');

		socket.on('loadMessages', (loadedMessages) => {
			messages = loadedMessages.map((message) => ({
				...message
			}));
			console.log(messages);
		});

		socket.on('message', (newMessage) => {
			const { UserID, Message, createdAt } = newMessage;
            console.log(newMessage);
			messages = [...messages, { UserID, Message, createdAt }];
		});

		// Simulate joining a room, replace 'eventId' with an actual value
		socket.emit('joinRoom', { eventID });

		setContext('sendMessage', sendMessage);
	});

    function getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop().split(';').shift();
	}
</script>

<main class="h-screen flex flex-col bg-gray-800 text-white">
	<!-- Chat messages display -->
	<div class="bg-gray-800 p-4">
		<h1 class="text-2xl font-semibold">{eventDetail.Name}</h1>
	</div>

	<div class="p-4 overflow-y-auto" style="max-height: calc(100% - 6rem);">
		{#each messages as { UserID, Message, createdAt }, i (i)}
			<div key={i} class="flex flex-col items-{UserID.Name === userDetail.Name ? 'end' : 'start'} mb-2">
				<div
					class="card p-4 rounded-lg"
					class:bg-blue-500={i % 2 === 0}
					class:bg-gray-600={i % 2 !== 0}
				>
					<div class="text-xs mb-1">{UserID.Name === userDetail.Name ? 'Me' : UserID.Name}</div>
					<div>{Message}</div>
					<div class="text-xs mt-1">{createdAt}</div>
				</div>
			</div>
		{/each}
	</div>

	<div class="fixed bottom-0 left-0 right-0 bg-gray-700 p-4 flex">
		<input
			type="text"
			class="flex-1 p-2 rounded-l-lg bg-gray-700 text-white"
			placeholder="Type your message..."
			bind:value={messageInput}
			on:keydown={(e) => e.key === 'Enter' && sendMessage(e.target.value)}
		/>
		<button
			class="bg-blue-500 text-white p-2 rounded-r-lg"
			on:click={() => sendMessage(messageInput)}>Send</button
		>
	</div>
</main>
