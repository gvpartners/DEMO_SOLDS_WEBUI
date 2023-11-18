import { API_BASE_URL, TOKEN } from 'src/config/config';

const getSunatValue = async (Name, Code) => {
    try {
        const authToken = sessionStorage.getItem('authToken');
        const response = await fetch(API_BASE_URL + '/api/Invoice/GetSunatValue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            },
            body: JSON.stringify({
                Name,
                Code
            })
        });
        const responseData = await response.text();

        return responseData;
    } catch (err) {
        console.log(err);
    }
}
const getAllInvoices = async () => {
    try {
        const authToken = sessionStorage.getItem('authToken');
        const response = await fetch(API_BASE_URL + '/api/Invoice/GetAllInvoices', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            },
        });
        return response;
    } catch (err) {
        console.log(err);
    }
}
const getInvoiceById = async (Id) => {
    try {
        const authToken = sessionStorage.getItem('authToken');
        const response = await fetch(API_BASE_URL + '/api/Invoice/GetInvoiceById/' + Id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            },
        });
        return response;
    } catch (err) {
        console.log(err);
    }
}
const createInvoice = async (data) => {
    try {
        const authToken = sessionStorage.getItem('authToken');
        const response = await fetch(API_BASE_URL + '/api/Invoice/CreateInvoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            },
            body: JSON.stringify(data),
        });

        return response;
    } catch (err) {
        console.log(err);
    }
}
const updateInvoice = async (Id, data) => {
    try {
        const authToken = sessionStorage.getItem('authToken');
        const response = await fetch(API_BASE_URL + '/api/Invoice/UpdateInvoice/' + Id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            },
            body: JSON.stringify(data),
        });

        return response;
    } catch (err) {
        console.log(err);
    }
}
const removeInvoice = async (Id) => {
    try {
        const authToken = sessionStorage.getItem('authToken');
        const response = await fetch(API_BASE_URL + '/api/Invoice/RemoveInvoice/' + Id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            }
        });

        return response;
    } catch (err) {
        console.log(err);
    }
}
const updateStatus = async (Id, orderStatus) => {
    try {
        const authToken = sessionStorage.getItem('authToken');
        const response = await fetch(API_BASE_URL + '/api/Invoice/UpdateStatusInvoice/' + Id + '/' + orderStatus, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            }
        });

        return response;
    } catch (err) {
        console.log(err);
    }
}
const generateExcel = async (data) => {
    try {
        const authToken = sessionStorage.getItem('authToken');
        const response = await fetch(API_BASE_URL + '/api/Invoice/GenerateExcel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            },
            body: JSON.stringify(data),
        });

        return response;
    } catch (error) {
        console.error('Error generating Excel:', error);
    }
}
const duplicateInvoice = async (Id) => {
    try {
        const authToken = sessionStorage.getItem('authToken');
        const response = await fetch(API_BASE_URL + '/api/Invoice/DuplicateInvoice/' + Id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            }
        });

        return response;
    } catch (err) {
        console.log(err);
    }
}
const summaryInfo = async () => {
    try {
        const authToken = sessionStorage.getItem('authToken');
        const response = await fetch(API_BASE_URL + '/api/Invoice/SummaryInfo', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            },
        });
        return response;
    } catch (err) {
        console.log(err);
    }
}
const updateCommentbyId = async (Id, Comment) => {
    try {
        const authToken = sessionStorage.getItem('authToken');
        const response = await fetch(API_BASE_URL + '/api/Invoice/UpdateCommentbyId/' + Id+'/'+ Comment, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            },
            
        });

        return response;
    } catch (error) {
        console.error('Error:', error);
    }
}
const getCommentById = async (Id) => {
    try {
        const authToken = sessionStorage.getItem('authToken');
        const response = await fetch(API_BASE_URL + '/api/Invoice/GetCommentById/' + Id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            },
        });
        return response.text();
    } catch (err) {
        console.log(err);
    }
}
export default {
    getSunatValue,
    getAllInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    removeInvoice,
    updateStatus,
    generateExcel,
    duplicateInvoice,
    summaryInfo,
    updateCommentbyId,
    getCommentById
};