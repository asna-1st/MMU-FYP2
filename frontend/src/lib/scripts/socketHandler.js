import io from 'socket.io-client';
import axiosInstance from './axiosInstance'

let socket;
let updateMessagesCallback;

export const connectSocket = (callback) => {
    updateMessagesCallback = callback;
    socket = io(import.meta.env.VITE_BACKEND_URL, {
    
    });

    socket.on('message', (data) => {
        //messages = [...messages, data];
        if (updateMessagesCallback) {
            updateMessagesCallback(data);
        }
    });
};

export const sendMessage = (message, username, eventID) => {
    //console.log('Sending message:', message);
    //console.log('EventID:', eventID);
    if (typeof message === 'string' && message.trim() !== '') {
        socket.emit('message', { message, username, eventID });
        //messages = [...messages, { text: message, username, timestamp: new Date() }];
    }
}

export const joinChat = (room) => {
    if (socket) {
        socket.emit('joinChat', room);
    }
};

export const getChatHistory = async (eventID, page = 1, pageSize = 10) => {
    try {
        const res = await axiosInstance.post(`/chat/history/${eventID}`, {
            params: {page, pageSize}
        });

        const data = res.data;
        //console.log('Response data:', data);

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