import { API_BASE_URL, TOKEN } from 'src/config/config';
import axios from 'src/config/axios';


const getAllTracks = (TrackPag) => {
    return axios.post('/api/Track/GetAllTracks', TrackPag);
}

const getTrackById = (id) => {
    return axios.get(`/api/Track/GetTrackById/${id}`);
};

const createTrack = (data) => {
    return axios.post('/api/Track/CreateTrack', data);
};

const updateTrack = (Id, data) => {
    return axios.post(`/api/Track/UpdateTrack/${Id}`, data);
};

const removeTrack = (Id) => {
    return axios.post(`/api/Track/RemoveTrack/${Id}`);
}
const updateStatus = (Id, orderStatus) => {
    return axios.post(`/api/Track/UpdateStatusTrack/${Id}/${orderStatus}`);
}

const generateExcel = async (data) => {
    try {
        const authToken = sessionStorage.getItem('authToken');
        const response = await fetch(API_BASE_URL + '/api/Track/GenerateExcel', {
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
const duplicateTrack = (id,userId) => {
    return axios.post(`/api/Track/DuplicateTrack/${id}/${userId}`);
}
const updateCommentbyId = (Id, Comment) => {
    return axios.post(`/api/Track/UpdateCommentbyId/${Id}/${Comment}`);
}
const getCommentById = (id) => {
    return axios.get(`/api/Track/GetCommentById/${id}`);
}

export default {
    getAllTracks,
    getTrackById,
    createTrack,
    updateTrack,
    removeTrack,
    updateStatus,
    generateExcel,
    duplicateTrack,
    updateCommentbyId,
    getCommentById
};