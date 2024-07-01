<script>
	import { onMount, afterUpdate, setContext } from 'svelte';
	import io from 'socket.io-client';
	import axiosInstance from '../../../../lib/scripts/axiosInstance.js';
	import { writable } from 'svelte/store';
	import LoadingScreen from '../../../../lib/component/LoadingScreen.svelte';
	import { DateTime } from 'luxon';
	export let data;

	let socket;
	let token;
	const eventID = data.eventID;
	let messages = [];
	let messageInput;
	let userDetail,
		eventDetail = 'Loading...';
	const loading = writable(true);
	let messageContainer;

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
			//console.log(userDetail);
		} catch (err) {
			console.error('Error fetching data:', err);
		}
	}

	function scrollToBottom() {
		if (messageContainer) {
			messageContainer.scrollTop = messageContainer.scrollHeight;
		}
	}

	onMount(async () => {
		token = getCookie('token');
		await fetchUserDetail();
		await fetchEventData();
		socket = io(import.meta.env.VITE_BACKEND_URL);

		socket.on('loadMessages', (loadedMessages) => {
			messages = loadedMessages.map((message) => ({
				...message
			}));
			//console.log(messages);
			scrollToBottom();
		});

		socket.on('message', (newMessage) => {
			const { UserID, Message, createdAt } = newMessage;
			//console.log(newMessage);
			messages = [...messages, { UserID, Message, createdAt }];
			scrollToBottom();
		});

		socket.emit('joinRoom', { eventID });
		loading.set(false);
		scrollToBottom();
	});

	afterUpdate(() => {
		scrollToBottom();
	});

	setContext('sendMessage', sendMessage);

	function getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop().split(';').shift();
	}

	function formatTimestamp(timestamp) {
		return DateTime.fromISO(timestamp).toLocaleString(DateTime.TIME_SIMPLE);
	}

	function formatDate(timestamp) {
		return DateTime.fromISO(timestamp).toFormat('cccc, LLLL dd, yyyy');
	}

	function separateMessagesByDay(messages) {
		const separatedMessages = [];
		let currentDate = null;
		messages.forEach((message) => {
			const messageDate = DateTime.fromISO(message.createdAt).toFormat('yyyy-MM-dd');
			if (messageDate !== currentDate) {
				separatedMessages.push({
					type: 'dateSeparator',
					date: formatDate(message.createdAt)
				});
				currentDate = messageDate;
			}
			separatedMessages.push({
				type: 'message',
				...message
			});
		});
		return separatedMessages;
	}
</script>

<LoadingScreen {loading} />
<main class="h-screen flex flex-col bg-gray-800 text-white">
	<div class="bg-gray-800 p-4">
		<h1 class="text-2xl font-semibold">{eventDetail.Name}</h1>
	</div>

	<div
		class="flex-1 p-4 overflow-y-auto min-w-[400px]"
		bind:this={messageContainer}
		style="word-wrap: break-word;"
	>
		{#each separateMessagesByDay(messages) as { type, UserID, Message, createdAt, date }, i (i)}
			{#if type === 'dateSeparator'}
				<div class="my-2 text-center text-gray-400">{date}</div>
			{:else}
				<div
					key={i}
					class="flex flex-col items-{UserID.Name === userDetail.Name ? 'end' : 'start'} mb-2"
				>
					{#if UserID.Name === userDetail.Name}
						<div class="card p-4 rounded-lg variant-filled-primary">
							<div class="text-xs mb-1 font-semibold">
								{UserID.Name === userDetail.Name ? 'Me' : UserID.Name}
							</div>
							<div style="white-space: pre-wrap;">{Message}</div>
							<div class="text-xs mt-1">{formatTimestamp(createdAt)}</div>
						</div>
					{:else}
						<div class="card p-4 rounded-lg variant-filled-secondary">
							<div class="text-xs mb-1 font-semibold">
								{UserID.Name === userDetail.Name ? 'Me' : UserID.Name}
							</div>
							<div style="white-space: pre-wrap;">{Message}</div>
							<div class="text-xs mt-1">{formatTimestamp(createdAt)}</div>
						</div>
					{/if}
				</div>
			{/if}
		{/each}
	</div>

	<div class="bg-gray-700 p-4 flex">
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