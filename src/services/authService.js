import { API_BASE_URL, TOKEN } from 'src/config/config';

const loginUser = async (values, helpers) => {
    try {
        const response = await fetch(API_BASE_URL + '/api/Auth/Login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        });
        if (response.ok) {
            const data = await response.json();
            const { success, token, user, identificator } = data;

            if (success) {
                sessionStorage.setItem('authToken', token);
                sessionStorage.setItem('authenticated', true);
                sessionStorage.setItem('userEmail', helpers);
                sessionStorage.setItem('user', user);
                sessionStorage.setItem('identificator', identificator);
            }
        }
        return response;
    } catch (err) {
        console.log(err);
    }
};
const registerUser = async (formattedValues) => {
    try {
        const response = await fetch(API_BASE_URL + '/api/Auth/Register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formattedValues),
        });

        return response;
    } catch (err) {
        console.log(err);
    }
}
const createRequest = async (formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/Auth/CreateRequest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error en la solicitud: ${response.status}`);
        }

        return await response.json();
    } catch (err) {
        console.error('Error al crear la solicitud:', err);
        throw err;
    }
};
const createVisit = async (formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/Auth/CreateVisit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error en la solicitud: ${response.status}`);
        }

        return await response.json();
    } catch (err) {
        console.error('Error al crear la solicitud:', err);
        throw err;
    }
};

export default { loginUser, registerUser, createRequest, createVisit };
