import { API_BASE_URL, TOKEN } from 'src/config/config';
import axios from 'src/config/axios';

const getSunatValue = (Name, Code) => {
    const data = {
        Name,
        Code
    };
    return axios.post('/api/Invoice/GetSunatValue', data)
}
const getAllInvoices = (invoicePag) => {
    return axios.post('/api/Invoice/GetAllInvoices', invoicePag);
}

const getInvoiceById = (id) => {
    return axios.get(`/api/Invoice/GetInvoiceById/${id}`);
};

const createInvoice = (data) => {
    return axios.post('/api/Invoice/CreateInvoice', data);
};

const updateInvoice = (Id, data) => {
    return axios.post(`/api/Invoice/UpdateInvoice/${Id}`, data);
};

const removeInvoice = (Id) => {
    return axios.post(`/api/Invoice/RemoveInvoice/${Id}`);
}
const updateStatus = (Id, orderStatus) => {
    return axios.post(`/api/Invoice/UpdateStatusInvoice/${Id}/${orderStatus}`);
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
const duplicateInvoice = (id) => {
    return axios.post(`/api/Invoice/DuplicateInvoice/${id}`);
}
const summaryInfo = () => {
    return axios.get('/api/Invoice/SummaryInfo');
};
const updateCommentbyId = (Id, Comment) => {
    return axios.post(`/api/Invoice/UpdateCommentbyId/${Id}/${Comment}`);
}
const getCommentById = (id) => {
    return axios.get(`/api/Invoice/GetCommentById/${id}`);
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