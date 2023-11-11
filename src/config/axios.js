import axios from 'axios';
import { API_BASE_URL } from 'src/config/config';

const instance = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para manejar la solicitud
instance.interceptors.request.use(
  (config) => {
    const authToken = sessionStorage.getItem('authToken');
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
let cont = 0;
// Interceptor para manejar la respuesta
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401 && cont==0) {
      cont++;
      // La sesión ha expirado, redirige a la página de inicio de sesión
      alert("La sesión ha expirado, vuelva a ingresar a la plataforma.");
      window.location.href = '/auth/login';
    }
    else{
      window.location.href = '/auth/login';
    }
    
    return Promise.reject(error);
  }
);

export default instance;
