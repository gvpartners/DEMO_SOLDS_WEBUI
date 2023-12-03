let API_BASE_URL = 'http://uniconbloquesapi.somee.com'; //el puerto magico 2
let TOKEN = '';

if (typeof sessionStorage !== 'undefined') {
  TOKEN = sessionStorage.getItem('authToken');
}

export { API_BASE_URL, TOKEN };