import { API_BASE_URL, TOKEN } from 'src/config/config';
import axios from 'src/config/axios';

const getSunatValue = (Name, Code) => {
    const data = {
        Name,
        Code
    };
    return axios.post('/api/Monitoring/GetSunatValue', data)
}

const getAllMonitorings = (monitoringPag) => {
    return axios.post('/api/Monitoring/GetAllMonitorings', monitoringPag);
}

const getMonitoringById = (id) => {
    return axios.get(`/api/Monitoring/GetMonitoringById/${id}`);
};

const createMonitoring = (data) => {
    return axios.post('/api/Monitoring/CreateMonitoring', data);
};

const updateMonitoring = (Id, data) => {
    return axios.post(`/api/Monitoring/UpdateMonitoring/${Id}`, data);
};

const removeMonitoring = (Id) => {
    return axios.post(`/api/Monitoring/RemoveMonitoring/${Id}`);
}

const updateStatus = (Id, orderStatus) => {
    return axios.post(`/api/Monitoring/UpdateStatusMonitoring/${Id}/${orderStatus}`);
}

const generateExcel = async (data) => {
    try {
        const authToken = sessionStorage.getItem('authToken');
        const response = await fetch(API_BASE_URL + '/api/Monitoring/GenerateExcel', {
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

const summaryInfo = () => {
    return axios.get('/api/Monitoring/SummaryInfo');
};

const updateCommentbyId = (Id, Comment) => {
    return axios.post(`/api/Monitoring/UpdateCommentbyId/${Id}/${Comment}`);
}

const getCommentById = (id) => {
    return axios.get(`/api/Monitoring/GetCommentById/${id}`);
}

const duplicateMonitoring = (id, userId) => {
    return axios.post(`/api/Monitoring/DuplicateMonitoring/${id}/${userId}`);
}

export default {
    getSunatValue,
    getAllMonitorings,
    getMonitoringById,
    createMonitoring,
    updateMonitoring,
    removeMonitoring,
    updateStatus,
    generateExcel,
    summaryInfo,
    updateCommentbyId,
    getCommentById,
    duplicateMonitoring
};
