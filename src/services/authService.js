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


export default { loginUser, registerUser };
