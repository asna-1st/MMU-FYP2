import io from 'socket.io-client';
import axios from 'axios';

let socket;
let updateMessagesCallback;

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8083', // Replace with your server URL
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'http://localhost:5173', // Replace with your client origin
    },
  });

export const connectSocket = (callback) => {
    updateMessagesCallback = callback;
    socket = io('http://localhost:8083', {
    
    });

    socket.on('message', (data) => {
        //messages = [...messages, data];
        if (updateMessagesCallback) {
            updateMessagesCallback(data);
        }
    });
};

export const sendMessage = (message, username, eventID) => {
    console.log('Sending message:', message);
    console.log('EventID:', eventID);
    if (typeof message === 'string' && message.trim() !== '') {
        socket.emit('message', { message, username, eventID });
        //messages = [...messages, { text: message, username, timestamp: new Date() }];
        // Assuming you want to update the local state with the sent message
    }
}

export const joinChat = (room) => {
    if (socket) {
        socket.emit('joinChat', room);
    }
};

export const getChatHistory = async (eventID, page = 1, pageSize = 10) => {
    try {
        const res = await axiosInstance.post(`http://localhost:8083/chat/history/${eventID}`, {
            params: {page, pageSize}
        });

        const data = res.data;
        console.log('Response data:', data);

        if (data.success == true) {
            return data.history;
        } else {
            return [];
        }
        //return data.success ? data.history : [];
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return [];
    }
}