import { DateTime } from 'luxon';

function convertTimeInput(dateTime) {
    const time = DateTime.fromISO(dateTime);
    return time.toFormat('hh:mm a');
}

function formatDateToInput(date) {
    const dt = DateTime.fromISO(date);
    return dt.toFormat('dd LLLL yyyy');
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function getToken() {
    return getCookie('token');
}

export default { getToken, formatDateToInput, convertTimeInput };
