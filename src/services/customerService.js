import axios from 'src/config/axios';

const getCustomers = () => {
  return axios.get('/api/Customer/GetAllCustomers');
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
    return axios.post(`/api/Customer/CreateCustomer`,selectedCustomer);
  };

export default {
  getCustomers,
  editCustomer,
  removeCustomer,
  getCustomerById,
  createCustomer
};
