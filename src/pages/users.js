import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import Swal from 'sweetalert2';
import { applyPagination } from 'src/utils/apply-pagination';
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Select,
  MenuItem,
  TablePagination,
  Menu,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import GetAppIcon from '@mui/icons-material/GetApp';
import DeleteIcon from '@mui/icons-material/Delete';
const now = new Date();
import { API_BASE_URL, TOKEN } from 'src/config/config';
import { ToastContainer, toast } from 'react-toastify';
import userService from 'src/services/userService';
import { Scrollbar } from 'src/components/scrollbar';

const Page = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [data, setData] = useState([]);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  const authToken = sessionStorage.getItem('authToken');

  const getUsers = async () => {
    try {
      const response = await userService.getUsers();

      if (response.status == 200) {
        const fetchedData = await response.data;
        setData(fetchedData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };
  const auxUser = useMemo(() => {
    return applyPagination(data, page, rowsPerPage);
  }, [data, page, rowsPerPage]);




  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await userService.getUsers();

        if (response.status == 200) {
          const fetchedData = await response.data;
          setData(fetchedData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
  };

  const handleEdit = (customerId) => {
    const customer = data.find((item) => item.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setEditedName(customer.name);
      setEditModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedCustomer(null);
    setEditedName('');
    setAnchorEl(null);
  };

  const handleFieldChange = (fieldName, value) => {
    setSelectedCustomer((prevCustomer) => ({
      ...prevCustomer,
      [fieldName]: value,
    }));
  };

  const handleDelete = async (id) => {
    setAnchorEl(null);
    const confirmDelete = await Swal.fire({
      title: 'Confirmación',
      text: '¿Estás seguro de que deseas eliminar a este usuario?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
  
    if (confirmDelete.isConfirmed) {
      setAnchorEl(null);
      const response = await userService.removeUser(id);
      if (response.status === 200) {
        setEditModalOpen(false);
        Swal.fire({
          title: 'Eliminación de usuario',
          text: 'Se eliminó satisfactoriamente al usuario.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          getUsers();
        });
      } else {
        Swal.fire({
          title: 'Eliminación de usuario',
          text: 'No se pudo eliminar al usuario.',
          icon: 'warning',
          confirmButtonText: 'OK',
        });
      }
    }
  };
  
  const handleMenuOpen = (event, customer) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(customer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };
  const handleSave = async () => {
    setAnchorEl(null);
    const response = await userService.editUser(selectedCustomer);
    if (response.status == 200) {
      setEditModalOpen(false);
      getUsers();
      Swal.fire({
        title: 'Edición de usuario.',
        text: 'Se editó satisfactoriamente al usuario.',
        icon: 'success',
        confirmButtonText: 'OK',
      }).then(() => {
        getUsers();
      });
    } else {
      Swal.fire({
        title: 'Edición de usuario.',
        text: 'No se pudo editar al usuario.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <>
      <Head>
        <title>Usuarios</title>
      </Head>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">Total de usuarios [{data.length}]</Typography>
              </Stack>
            </Stack>
            {data.length === 0 ? (
              <Typography variant="body1">No hay usuarios en la aplicación.</Typography>
            ) : (
              <Scrollbar>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Apellido Paterno</TableCell>
                      <TableCell>Apellido Materno</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Prefijo</TableCell>
                      <TableCell>Teléfono</TableCell>
                      <TableCell>¿Tiene acceso?</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auxUser.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.firstLastName}</TableCell>
                        <TableCell>{item.secondLastName}</TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>{item.prefix}</TableCell>
                        <TableCell>{item.phone || 'No proporcionado'}</TableCell>
                        <TableCell>{item.isApproved ? 'Sí' : 'No'}</TableCell>
                        <TableCell>
                          <IconButton
                            aria-label="Acciones"
                            aria-controls={`actions-menu-${item.id}`}
                            aria-haspopup="true"
                            onClick={(event) => handleMenuOpen(event, item)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            id={`actions-menu-${item.id}`}
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl) && selectedCustomer && selectedCustomer.id === item.id}
                            onClose={handleMenuClose}
                          >
                            <MenuItem onClick={() => handleEdit(item.id)}><EditIcon /> Editar</MenuItem>
                            <MenuItem onClick={() => handleDelete(item.id)}> <DeleteIcon /> Eliminar</MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Scrollbar>
            )}
            <TablePagination
              component="div"
              count={data.length}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage={"Elementos por página"}
            />
          </Stack>

        </Container>
      </Box>

      <Dialog open={isEditModalOpen} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
        <DialogTitle style={{ textAlign: 'center' }}>Editar Usuario</DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <div>
              <TextField
                label="Nombre"
                value={selectedCustomer.name}
                onChange={(event) => handleFieldChange('name', event.target.value)}
                fullWidth
                margin="normal"
              />

              <TextField
                label="Apellido Paterno"
                value={selectedCustomer.firstLastName}
                onChange={(event) => handleFieldChange('firstLastName', event.target.value)}
                fullWidth
                margin="normal"
              />

              <TextField
                label="Apellido Materno"
                value={selectedCustomer.secondLastName}
                onChange={(event) => handleFieldChange('secondLastName', event.target.value)}
                fullWidth
                margin="normal"
              />

              <TextField
                label="Email"
                value={selectedCustomer.email}
                onChange={(event) => handleFieldChange('email', event.target.value)}
                fullWidth
                disabled
                margin="normal"
              />

              <TextField
                label="Prefijo"
                value={selectedCustomer.prefix}
                onChange={(event) => handleFieldChange('prefix', event.target.value)}
                fullWidth
                margin="normal"
              />
              <Typography variant="subtitle2">Tiene Acceso?</Typography>
              <Select
                value={selectedCustomer.isApproved ? 'si' : 'no'}
                onChange={(event) => handleFieldChange('isApproved', event.target.value === 'si')}
                fullWidth
                margin="normal"
              >
                <MenuItem value="si">Sí</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
            </div>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseEditModal} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSave} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
