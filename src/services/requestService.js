import { API_BASE_URL, TOKEN } from 'src/config/config';
import axios from 'src/config/axios';


const getAllRequests = (invoicePag) => {
    return axios.post('/api/Request/GetAllRequest', invoicePag);
}
const removeInvoice = (Id) => {
    return axios.post(`/api/Invoice/RemoveInvoice/${Id}`);
}

export default {
    getAllRequests,
    removeInvoice
};