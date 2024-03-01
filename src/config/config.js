// let API_BASE_URL = 'https://uniconbloquesapi.somee.com';
let API_BASE_URL = 'https://uniconbloquesappweb.somee.com';
// let API_BASE_URL = 'https://localhost:7123';

let TOKEN = '';

if (typeof sessionStorage !== 'undefined') {
  TOKEN = sessionStorage.getItem('authToken');
}

export { API_BASE_URL, TOKEN };