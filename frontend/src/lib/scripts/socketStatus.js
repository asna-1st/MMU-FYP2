import io from 'socket.io-client';

const socket = io('http://localhost:8083');

export function handleAttendanceEvent(callback) {
    socket.on('attendance', (data) => {
        callback(data);
    });
}