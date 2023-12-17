import axios from 'src/config/axios';

const getCustomers = (customerPag) => {
  return axios.post('/api/Customer/GetAllCustomers', customerPag);
};

const editCustomer = (selectedCustomer) => {
  return axios.put(`/api/Customer/UpdateCustomer/${selectedCustomer.id}`, selectedCustomer);
};

const removeCustomer = (id) => {
  return axios.put(`/api/Customer/RemoveCustomer/${id}`);
};

const getCustomerById = (id) => {
  return axios.get(`/api/Customer/GetCustomerById/${id}`);
};

const createCustomer = (selectedCustomer) => {
  return axios.post(`/api/Customer/CreateCustomer`, selectedCustomer);
};

const getIsCustomerInDb = (customerNumber) => {
  return axios.get(`/api/Customer/GetIsCustomerInDb/${customerNumber}`);
}
export default {
  getCustomers,
  editCustomer,
  removeCustomer,
  getCustomerById,
  createCustomer,
  getIsCustomerInDb
};
