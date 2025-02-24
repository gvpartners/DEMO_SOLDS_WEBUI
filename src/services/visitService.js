import { API_BASE_URL, TOKEN } from 'src/config/config';
import axios from 'src/config/axios';

// Obtener todas las visitas
const getAllVisits = (visitPag) => {
    return axios.post('/api/Visit/GetAllVisits', visitPag);
};

// Actualizar el estado de una visita
const updateVisitStatus = (visitId, status) => {
    return axios.post('/api/Visit/UpdateVisitStatus', null, {
        params: {
            visitId: visitId,
            status: status,
        },
    });
};

// Actualizar el comentario de una visita
const updateCommentById = (visitId, newComment) => {
    return axios.post('/api/Visit/UpdateCommentbyId', null, {
        params: {
            visitId: visitId,
            newComment: newComment,
        },
    });
};

// Obtener el comentario de una visita por ID
const getCommentById = (id) => {
    return axios.get(`/api/Visit/GetCommentById/${id}`);
};

// Eliminar una visita
const removeVisit = (Id) => {
    return axios.post(`/api/Visit/RemoveVisit/${Id}`);
};

// Actualizar una visita
const updateVisit = (visitId, updatedData) => {
    return axios.post('/api/Visit/UpdateVisit', updatedData, {
        params: {
            visitId: visitId,
        },
    });
};

export default {
    getAllVisits,
    updateVisitStatus,
    updateCommentById,
    getCommentById,
    removeVisit,
    updateVisit, // Nuevo método agregado
};