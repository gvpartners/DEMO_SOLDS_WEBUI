import axios from 'src/config/axios';

const getUsers = () => {
  return axios.get('/api/Users/GetAllUsers');
};

const editUser = (selectedCustomer) => {
  return axios.post('/api/Users/EditUser', selectedCustomer);
};

const removeUser = (id) => {
  return axios.put(`/api/Users/RemoveItem/${id}`);
};

const getUserById = (id) => {
  return axios.get(`/api/Users/GetUserById/${id}`);
};

const updateUserById = (data) => {
  return axios.put('/api/Users/UpdateUserById', data);
};

const updatePasswordById = (id, password) => {
  return axios.put(`/api/Users/UpdatePasswordById/${id}/${password}`);
}
export default {
  getUsers,
  editUser,
  removeUser,
  getUserById,
  updateUserById,
  updatePasswordById
};