import { goto } from '$app/navigation';

export function checkTokenValidity() {
    const token = localStorage.getItem('token');
    if (!token || !isValidToken(token)) {
        localStorage.removeItem('token');
        goto('/auth/signin');
    }
}

function isValidToken(token) {
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const currentTimestamp = Math.floor(Date.now() / 1000);
      return decodedToken.exp && decodedToken.exp > currentTimestamp;
    } catch (error) {
      return false;
    }
  }