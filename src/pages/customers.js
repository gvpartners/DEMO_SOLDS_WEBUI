import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import Swal from 'sweetalert2';
import { applyPagination } from 'src/utils/apply-pagination';
import PlusIcon from '@mui/icons-material/Add';
import invoiceService from 'src/services/invoiceService';
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
  SvgIcon,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import customerService from 'src/services/customerService';
import SearchIcon from '@mui/icons-material/Search';
import { Scrollbar } from 'src/components/scrollbar';

const Page = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [data, setData] = useState([]);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setNewCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterIdentificationType, setFilterIdentificationType] = useState('');
  const [filterIdentificationInfo, setFilterIdentificationInfo] = useState('');
  const authToken = sessionStorage.getItem('authToken');

  const getCustomers = async () => {
    try {
      const response = await customerService.getCustomers();

      if (response.status === 200) {
        const fetchedData = await response.data;
        setData(fetchedData);

      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };
  const filteredCustomers = data.filter((item) => {
    const matchesName = item.customerName.toLowerCase().includes(filterName.toLowerCase());
    const matchesIdentificationType =
      !filterIdentificationType || item.identificationType === filterIdentificationType;
    const matchesIdentificationInfo = item.identificationInfo.includes(filterIdentificationInfo);

    return matchesName && matchesIdentificationType && matchesIdentificationInfo;
  });
  const auxCustomers = useMemo(() => {
    return applyPagination(filteredCustomers, page, rowsPerPage);
  }, [data, page, rowsPerPage, filterName, filterIdentificationType, filterIdentificationInfo]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getCustomers();
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
      setEditedName(customer.identificationInfo);
      setEditModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setNewCustomerModalOpen(false);
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
    try {
      const response = await customerService.removeCustomer(id);
      if (response.status === 200) {
        setEditModalOpen(false);
        Swal.fire({
          title: 'Eliminación de cliente.',
          text: 'Se eliminó satisfactoriamente al cliente.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          getCustomers();
        });
      } else {
        Swal.fire({
          title: 'Eliminación de cliente.',
          text: 'No se pudo eliminar al cliente.',
          icon: 'warning',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const getSunatValue = async () => {
    setIsLoading(true);
    try {
      const response = await invoiceService.getSunatValue(selectedCustomer.identificationType.toLowerCase(), selectedCustomer.identificationInfo);
      if (response.data != "error") {        
        selectedCustomer.customerName = response.data;
      }
      else {
        handleCloseEditModal();
        Swal.fire({
          title: 'No se encontró resultados en la búsqueda.',
          text: 'Ingresa manualmente',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
      }

    } catch (error) {
      handleCloseEditModal();
      Swal.fire({
        title: 'No se pudo realiza la busqueda',
        text: 'Ingresa manualmente',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading(false);
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
    try {
      const response = await customerService.editCustomer(selectedCustomer);
      if (response.status === 200) {
        setEditModalOpen(false);
        getCustomers();
        Swal.fire({
          title: 'Edición de cliente.',
          text: 'Se editó satisfactoriamente al cliente.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          getCustomers();
        });
      } else {
        Swal.fire({
          title: 'Edición de cliente.',
          text: 'No se pudo editar al cliente.',
          icon: 'warning',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error editing customer:', error);
    }
  };

  const handleOpenNewCustomerModal = () => {
    setNewCustomerModalOpen(true);
  };

  const handleSaveNewCustomer = async () => {
    try {
      const response = await customerService.createCustomer(selectedCustomer);
      if (response.status === 200) {
        setNewCustomerModalOpen(false);
        getCustomers();
        Swal.fire({
          title: 'Creación de cliente.',
          text: 'Se editó satisfactoriamente al cliente.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          getCustomers();
        });
      } else {
        Swal.fire({
          title: 'Creación de cliente.',
          text: 'No se pudo editar al cliente.',
          icon: 'warning',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error editing customer:', error);
    }
    getCustomers();
  };

  const clearFilters = () => {
    setFilterName('');
    setFilterIdentificationType('');
    setFilterIdentificationInfo('');
  };

  return (
    <>
      <Head>
        <title>Clientes</title>
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
                <Typography variant="h4">Total de clientes [{filteredCustomers.length}]</Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" color="primary" onClick={handleOpenNewCustomerModal}
                  startIcon={
                    <SvgIcon fontSize="small">
                      <PlusIcon />
                    </SvgIcon>
                  }>
                  Añadir Nuevo Cliente
                </Button>
                <Button variant="outlined" onClick={clearFilters}>
                  Limpiar Filtros
                </Button>
              </Stack>
            </Stack>
            {data.length === 0 ? (
              <Typography variant="body1">No hay clientes en la aplicación.</Typography>
            ) : (
              <Scrollbar>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TextField
                          label="Cliente"
                          value={filterName}
                          onChange={(event) => setFilterName(event.target.value)}
                          sx={{ width: '240px' }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          label="Tipo de Identificación"
                          select
                          value={filterIdentificationType}
                          onChange={(event) => setFilterIdentificationType(event.target.value)}
                          sx={{ width: '240px' }}
                        >
                          <MenuItem value="">Todos</MenuItem>
                          <MenuItem value="DNI">DNI</MenuItem>
                          <MenuItem value="RUC">RUC</MenuItem>
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          sx={{ width: '240px' }}
                          label="Número de Identificación"
                          value={filterIdentificationInfo}
                          onChange={(event) => setFilterIdentificationInfo(event.target.value)}
                        />
                      </TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auxCustomers.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.customerName}</TableCell>
                        <TableCell>{item.identificationType}</TableCell>
                        <TableCell>{item.identificationInfo}</TableCell>
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
              count={filteredCustomers.length}
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

      <Dialog open={isEditModalOpen || isNewCustomerModalOpen} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
        <DialogTitle style={{ textAlign: 'center' }}>
          {isEditModalOpen ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Tipo de Identificación"
            select
            fullWidth
            value={selectedCustomer ? selectedCustomer.identificationType : ''}
            onChange={(event) => handleFieldChange('identificationType', event.target.value)}
            margin="normal"
          >
            <MenuItem value="DNI">DNI</MenuItem>
            <MenuItem value="RUC">RUC</MenuItem>
          </TextField>
          <TextField
            disabled={!selectedCustomer?.identificationType}
            label="Número de Identificación"
            value={selectedCustomer ? selectedCustomer.identificationInfo : ''}
            type="number"
            onChange={(event) => handleFieldChange('identificationInfo', event.target.value)}
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" onClick={getSunatValue} disabled={!selectedCustomer?.identificationType}>
                    {isLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      <SearchIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Nombre del Cliente"
            value={selectedCustomer ? selectedCustomer.customerName : editedName}
            onChange={(event) => handleFieldChange('customerName', event.target.value)}
            fullWidth
            margin="normal"
          />

        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseEditModal} color="primary">
            Cancelar
          </Button>
          <Button onClick={isEditModalOpen ? handleSave : handleSaveNewCustomer} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
