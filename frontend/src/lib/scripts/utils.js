function convertDateString(dateTime) {
    const date = DateTime.fromISO(dateTime);
    return date.toFormat('d LLLL y');
}

function convertTimeString(dateTime) {
    const time = DateTime.fromISO(dateTime);
    return time.toFormat('h:mm a');
}

function convertTimeInput(dateTime) {
    const time = new Date(dateTime);
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return hours + ':' + minutes;
}

function formatDateToInput(date) {
    date = new Date(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function getToken() {
    return getCookie('token');
}

//module.exports = {getToken, convertDateString, convertTimeString};
export default {getToken, convertDateString, convertTimeString};
