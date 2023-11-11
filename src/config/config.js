let API_BASE_URL = 'https://localhost:7123'; //el puerto magico
let TOKEN = '';

if (typeof sessionStorage !== 'undefined') {
  TOKEN = sessionStorage.getItem('authToken');
}

export { API_BASE_URL, TOKEN };