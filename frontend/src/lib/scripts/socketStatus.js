import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_BACKEND_URL);

export function handleAttendanceEvent(callback) {
    socket.on('attendance', (data) => {
        callback(data);
    });
}