import React, { useEffect } from 'react';
import { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import PlusIcon from '@mui/icons-material/Add';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { applyPagination } from 'src/utils/apply-pagination';
import { useRouter } from 'next/router';
import trackService from 'src/services/trackService';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import GetAppIcon from '@mui/icons-material/GetApp';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Close from '@mui/icons-material/Close';
import Swal from 'sweetalert2';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { SeverityPill } from 'src/components/severity-pill';
import { es } from 'date-fns/locale'
import Autocomplete from '@mui/material/Autocomplete';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import fletesJson from 'src/config/fletes.json';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import uniconJson from 'src/config/unicon.json';
import CommentIcon from '@mui/icons-material/Comment';
import { saveAs } from 'file-saver';
import userService from 'src/services/userService';
import CloseIcon from '@mui/icons-material/Close';
import { PacmanLoader } from 'react-spinners';
import {
  Avatar,
  Container,
  Stack,
  Typography,
  Button,
  SvgIcon,
  Box,
  Card,
  TableCell,
  TableHead,
  TableBody,
  TableRow,
  Table,
  TablePagination,
  Hidden,
  InputLabel,
  Select,
  Grid,
  TextareaAutosize
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import customerService from 'src/services/customerService';

const Page = () => {
  const [orderBy, setOrderBy] = useState('createdOn');
  const [order, setOrder] = useState('asc');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [selectedStatusNumber, setSelectedStatusNumber] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [totalTracks, setTotalTracks] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusOptions, setstatusOptions] = useState(['En progreso', 'Atendido', 'Rechazada']);
  const [categoryOptions, setCategoryOptions] = useState([])
  const [UMOptions, setUMOptions] = useState(['MT2', 'PZA', 'MLL'])
  const [deliveryOptions, setdeliveryOptions] = useState(['Entregado en planta', 'Puesto en obra']);
  const [districtOptions, setDistrictOptions] = useState([])
  const [employeeOptions, setEmployeeOptions] = useState([])
  // Filters Export
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };
  const handleEndDateChange = (date) => {
    setEndDate(date);
  };
  const [loading, setLoading] = useState(false);
  const [isDialogOpenComment, setIsDialogOpenComment] = useState(false);
  const [comment, setComment] = useState('');
  const getCommentById = async () => {
    setComment('');
    try {
      const response = await trackService.getCommentById(selectedTrackId);
      if (response.status == 200) {
        setComment(response.data);
      }
      setIsDialogOpenComment(true);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleDialogCommentOpen = () => {
    setIsDialogOpenComment(true);
  };

  const handleDialogCommentClose = () => {
    setAnchorEl(null);
    setIsDialogOpenComment(false);
  };
  const router = useRouter();

  const [filterCode, setFilterCode] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterIdentification, setFilterIdentification] = useState('');
  const [filterPrice, setFilterPrice] = useState('');
  const [filterDelivery, setFilterDelivery] = useState('');
  const [filterEmployee, setFilterEmployee] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterCantPieces, setFilterCantPieces] = useState('');
  const [filterUnitPiece, setFilterUnitPiece] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterAddress, setFilterAddress] = useState('');
  const [filterReference, setFilterReference] = useState('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterContact, setFilterContact] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState(null);
  const [selectedOrderDate, setSelectedOrderDate] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [resetFilter, setResetFilter] = useState(false);

  const getTracks = async () => {
    try {
      var trackPag = {
        pageNumber: page,
        pageSize: rowsPerPage,
        filters: {
          trackCodeFilter: filterCode,
          identificationInfoFilter: filterClient,
          selectedCategoryFilter: filterCategory,
          identificationTypeFilter: filterIdentification,
          deliveryTypeFilter: filterDelivery,
          employeeFilter: filterEmployee,
          statusNameFilter: filterStatus,
          totalOfPieces: filterCantPieces,
          unitPieceFilter: filterUnitPiece,
          telephoneFilter: filterPhone,
          contactFilter: filterContact,
          trackDate: selectedDate,
          orderDate: selectedOrderDate,
          deliveryDate: selectedDeliveryDate,

        }
      };
      const response = await trackService.getAllTracks(trackPag);

      if (response.status == 200) {
        const fetchedData = await response.data;
        setTotalTracks(fetchedData.total)
        setTracks(fetchedData.tracks);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const clearFilters = () => {
    setFilterCode('');
    setFilterClient('');
    setFilterCategory('');
    setFilterIdentification('');
    setFilterPrice('');
    setFilterDelivery('');
    setFilterEmployee('');
    setFilterEmployee(null);
    setResetFilter((prev) => !prev);
    setFilterStatus(null);
    setFilterCantPieces('');
    setFilterUnitPiece('');
    setFilterDistrict('');
    setFilterAddress('');
    setFilterReference('');
    setFilterPhone('');
    setFilterContact('');
    setSelectedDate(null);
    setSelectedDeliveryDate(null);
    setSelectedOrderDate(null);
    getTracks();
  };
  const getUsers = async () => {
    try {
      const response = await userService.getUsers();

      if (response.status === 200) {
        const fetchedData = await response.data;

        const employeeData = fetchedData.map((user) => ({
          id: user.id,
          name: `${user.name} ${user.firstLastName}`,
          email: user.email,
          phone: user.phone
        }));

        setEmployeeOptions(employeeData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    const uniqueCategories = Array.from(new Set(uniconJson.map(item => item.Category)));
    setCategoryOptions(uniqueCategories);
    const districtOpt = fletesJson.map((district) => district.District);
    setDistrictOptions(districtOpt);
    getUsers();
  }, []);


  const handleNewTrack = () => {
    router.push('/new-tracker')
  }

  useEffect(() => {
    getTracks();
  }, [
    page,
    rowsPerPage,
    filterCode,
    filterClient,
    filterCategory,
    filterIdentification,
    filterPrice,
    filterDelivery,
    filterEmployee,
    filterStatus,
    filterCantPieces,
    filterUnitPiece,
    filterDistrict,
    filterAddress,
    filterReference,
    filterPhone,
    filterContact,
    selectedDate,
    selectedOrderDate,
    selectedDeliveryDate
  ]);

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage);
  }, [setPage]);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, [setRowsPerPage, setPage]);

  const [customerAddress, setCustomerAddress] = useState('');
  const [employeePhone, setEmployeePhone] = useState('');

  const getCustomerAddress = async (documentInfo) => {
    try {
      const response = await customerService.getCustomerAddress(documentInfo);

      if (response.status === 200) {
        const fetchedData = response.data;
        setCustomerAddress(fetchedData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };
  const getEmployeePhone = (track) => {
    const matchingEmployee = employeeOptions?.find(x => x.email === track.createdBy);

    if (matchingEmployee && matchingEmployee.phone) {
      setEmployeePhone(matchingEmployee.phone);
      setSelectedTrack(prevTrack => ({
        ...prevTrack,
        employeePhone: matchingEmployee.phone
      }));
    }
  }
  const handleMenuClick = (event, track) => {
    setSelectedTrack(track);
    setSelectedTrackId(track.id);
    setSelectedStatusNumber(track.statusOrder);
    setSelectedUserId(track.userId);
    getCustomerAddress(track.documentInfo);
    getEmployeePhone(track);
    setAnchorEl(event.currentTarget);
  };

  useEffect(() => {
    // This code will run when customerAddress is updated
    setSelectedTrack(prevTrack => ({
      ...prevTrack,
      customerAddress: customerAddress
    }));
  }, [customerAddress]);




  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDownloadPDF = () => {
    if (selectedTrack) {
      handleDownloadPDFTrack(selectedTrack);
    }
  };
  const handlePreviewPDF = () => {
    if (selectedTrack) {
      PDFPreview(selectedTrack);
    }
  };

  const statusMap = {
    1: 'warning',
    2: 'success',
    3: 'error',
    "ENTREGADO EN PLANTA": 'primary',
    "PUESTO EN OBRA": 'info'
  };
  const editTrack = () => {
    if (selectedTrackId) {
      router.push(`/new-tracker?TrackId=${selectedTrackId}`);
    }
  };
  const duplicateTrack = async (userId) => {
    setAnchorEl(null);
    const confirmAction = await Swal.fire({
      title: 'Confirmar',
      text: '¿Está seguro de duplicar el pedido?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, duplicar',
      cancelButtonText: 'Cancelar',
    });

    if (confirmAction.isConfirmed) {
      try {
        await trackService.duplicateTrack(selectedTrackId, userId);
        Swal.fire({
          title: 'Pedido duplicado',
          text: 'Se duplicó satisfactoriamente el pedido',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        getTracks();
      } catch (error) {
        console.error('Error al duplicar el pedido:', error);
        Swal.fire({
          title: 'Error al duplicar el pedido',
          text: 'No se pudo duplicar el pedido. Por favor, inténtelo de nuevo.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    }
  };
  const updateStatus = async (orderStatus) => {
    try {
      setAnchorEl(null);
      const confirmAction = await Swal.fire({
        title: 'Confirmar acción',
        text: '¿Está seguro de realizar esta acción?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, realizar',
        cancelButtonText: 'Cancelar',
      });

      if (confirmAction.isConfirmed) {
        const response = await trackService.updateStatus(selectedTrackId, orderStatus);

        if (response.status == 200) {
          setAnchorEl(null);
          if (orderStatus === 2) {
            Swal.fire({
              title: 'Pedido atendido',
              text: 'Se atendió satisfactoriamente el pedido',
              icon: 'success',
              confirmButtonText: 'OK',
            });
          } else if (orderStatus === 3) {
            Swal.fire({
              title: 'Pedido rechazado',
              text: 'Se rechazó satisfactoriamente el pedido',
              icon: 'success',
              confirmButtonText: 'OK',
            });
          } else {
            Swal.fire({
              title: 'Error',
              text: error.message || 'Hubo un error al actualizar el estado de el pedido',
              icon: 'error',
              confirmButtonText: 'OK',
            });
          }
          clearFilters();
        }
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.message || 'Hubo un error al actualizar el estado de el pedido',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };


  const removeTrack = async () => {
    try {
      setAnchorEl(null);
      const confirmAction = await Swal.fire({
        title: 'Confirmar eliminación',
        text: '¿Está seguro de eliminar este pedido?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });

      if (confirmAction.isConfirmed) {
        const response = await trackService.removeTrack(selectedTrackId);

        if (response.status == 200) {
          setAnchorEl(null);
          Swal.fire({
            title: 'Eliminación de Pedido',
            text: 'Se eliminó satisfactoriamente el pedido',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          clearFilters();
        } else {
          Swal.fire({
            title: 'Error',
            text: error.message || 'Hubo un error al eliminar el pedido',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.message || 'Hubo un error al eliminar el pedido',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };


  const formatter = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  });

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setIsDatePickerOpen(false);
  };
  const handleDeliveryDateChange = (date) => {
    setSelectedDeliveryDate(date);
    setIsDatePickerOpen(false);
  };

  const handleOrderDateChange = (date) => {
    setSelectedOrderDate(date);
    setIsDatePickerOpen(false);
  };
  const handleDialogClose = () => {
    setStartDate(null);
    setEndDate(null);
    setIsDialogOpen(false);
  }
  const saveComment = async () => {
    setIsDialogOpenComment(false);
    setAnchorEl(null);
    if (!comment.trim()) {
      Swal.fire({
        title: 'Advertencia',
        text: 'El comentario no puede estar vacío',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    const response = await trackService.updateCommentbyId(selectedTrackId, comment);
    if (response.status == 200) {
      setIsDialogOpenComment(false);
      setAnchorEl(null);
      Swal.fire({
        title: 'Actualización de comentario',
        text: 'Se actualizó satisfactoriamente el comentario',
        icon: 'success',
        confirmButtonText: 'OK',
      });
      setComment('');
    }
  };
  const exportReport = async () => {
    if (!startDate || !endDate || endDate < startDate) {
      setIsDialogOpen(false);
      Swal.fire({
        title: 'Corregir fecha',
        text: 'La fecha de fin no puede ser antes a la fecha de incio',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }
    else {
      const dataExport = {
        category: "Todos",
        statusName: "Todos",
        deliveryType: "Todos",
        district: "Todos",
        employee: "Todos",
        startDate: startDate,
        endDate: endDate,
      }
      setLoading(true);
      const response = await trackService.generateExcel(dataExport);
      if (!response.ok) {
        setLoading(false);
        throw new Error(`Error generating Excel: ${response.statusText}`);
      }
      const blob = await response.blob();
      const date = new Date().toLocaleString('es-PE', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      saveAs(blob, 'Reporte de pedidos' + date + '.xlsx');
      setLoading(false);
    }
    setIsDialogOpen(false);
  };

  const renderTracks = (inv) => {
    return inv.map((track) => {
      const adjustedDate = new Date(track.createdOn);
      const adjustedDeliveryDate = new Date(track.deliveryDate);
      const adjustedOrderDate = new Date(track.orderDate);

      const formattedDate = adjustedDate.toLocaleString('es-PE', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
      const formattedDeliveryDate = adjustedDeliveryDate.toLocaleString('es-PE', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
      const formattedOrderDate = adjustedOrderDate.toLocaleString('es-PE', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
      return (
        <TableRow hover key={track.id}>
          <TableCell>{track.trackCode}</TableCell>
          <TableCell>{track.identificationInfo || "No proporcionado"}</TableCell>
          <TableCell>
            <SeverityPill color='primary'>
              {track.selectedCategory}
            </SeverityPill>
          </TableCell>
          <TableCell>{formattedDate}</TableCell>
          {/* <TableCell>{formattedOrderDate}</TableCell> */}
          <TableCell>{formattedDeliveryDate}</TableCell>
          <TableCell>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <SeverityPill color={statusMap[track.statusOrder]}>
                  {track.statusName}
                </SeverityPill>
              </div>
              <div>
                <IconButton onClick={(event) => handleMenuClick(event, track)}>
                  <MoreVertIcon />
                </IconButton>

                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                  <div hidden={selectedUserId !== sessionStorage.getItem('identificator')}>
                    <div hidden={selectedStatusNumber !== 1}>
                      <MenuItem style={{ marginRight: '8px', color: 'green' }} onClick={() => updateStatus(2)}>
                        <CheckCircle style={{ marginRight: '8px' }} /> Atendido
                      </MenuItem>
                      <MenuItem style={{ marginRight: '8px', color: 'red' }} onClick={() => updateStatus(3)}>
                        <Close style={{ marginRight: '8px' }} /> Rechazar
                      </MenuItem>
                      <MenuItem onClick={() => editTrack()} style={{ display: 'flex', alignItems: 'center' }}>
                        <EditIcon style={{ marginRight: '8px' }} /> Editar
                      </MenuItem>
                      <MenuItem onClick={() => removeTrack()} style={{ display: 'flex', alignItems: 'center' }}>
                        <DeleteIcon style={{ marginRight: '8px' }} /> Eliminar
                      </MenuItem>
                    </div>
                  </div>
                  <div hidden={selectedStatusNumber === 1 || selectedStatusNumber === 3 || selectedUserId !== sessionStorage.getItem('identificator')}>
                    <MenuItem style={{ marginRight: '8px', color: 'red' }} onClick={() => updateStatus(3)}>
                      <Close style={{ marginRight: '8px' }} /> Rechazar
                    </MenuItem>
                  </div>
                  <div>
                    <MenuItem onClick={() => duplicateTrack(sessionStorage.getItem('identificator'))} style={{ display: 'flex', alignItems: 'center' }}>
                      <FileCopyIcon style={{ marginRight: '8px' }} /> Duplicar
                    </MenuItem>
                  </div>
                  <div>
                    <MenuItem onClick={() => getCommentById()} style={{ display: 'flex', alignItems: 'center' }}>
                      <CommentIcon style={{ marginRight: '8px' }} /> Comentario
                    </MenuItem>
                  </div>
                </Menu>
              </div>
            </div>
          </TableCell>

          <TableCell>{new Intl.NumberFormat('en-US').format(track.totalOfPieces)}</TableCell>
          <TableCell>{track.unitPiece}</TableCell>

          <TableCell>
            <SeverityPill color={statusMap[track.deliveryType]}>
              {track.deliveryType}
            </SeverityPill>
          </TableCell>
          <TableCell>{track.contact || "No proporcionado"}</TableCell>
          <TableCell>{track.telephone || "No proporcionado"}</TableCell>
          <TableCell>{track.documentInfo || "XXXXXXXXXX"}</TableCell>
          <TableCell>{track.employee}</TableCell>

        </TableRow>
      );
    });
  }

  return (
    <>
      <Head>
        <title>Pedidos</title>
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
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Typography variant="h4">Total de pedidos [{new Intl.NumberFormat('en-US').format(totalTracks)}]</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="contained" onClick={clearFilters}>
                    Limpiar Filtros
                  </Button>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    startIcon={<SvgIcon fontSize="small"><ArrowDownOnSquareIcon /></SvgIcon>}
                    variant="outlined"
                  >
                    Exportar
                  </Button>
                  <Button
                    onClick={handleNewTrack}
                    startIcon={
                      <SvgIcon fontSize="small">
                        <PlusIcon />
                      </SvgIcon>
                    }
                    variant="outlined"
                  >
                    Nuevo pedido
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            <Card>
              <Scrollbar>
                <Box sx={{ minWidth: 800 }}>
                  <br />
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <TextField sx={{ width: '160px', marginRight: '-30px' }}
                            label="Código"
                            value={filterCode}
                            type='number'
                            onChange={(e) => setFilterCode(e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField sx={{ width: '225px', marginRight: '-20px' }}
                            label="Cliente"
                            value={filterClient}
                            onChange={(e) => setFilterClient(e.target.value)}
                          />
                        </TableCell>

                        
                        <TableCell >
                          <Autocomplete
                            value={filterCategory}
                            onChange={(event, newValue) => setFilterCategory(newValue)}
                            options={categoryOptions}
                            renderInput={(params) => (
                              <TextField sx={{ width: '130px', marginRight: '-10px' }}
                                {...params}
                                label="Categoria"
                                variant="standard"
                              />
                            )}
                          />
                        </TableCell>


                        <TableCell>
                          <div style={{ display: 'flex', alignItems: 'center', width: '150px', marginRight: '-20px' }}>
                            <span >Fecha de creación</span>

                          </div><br />
                          <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
                            <DatePicker
                              value={selectedDate}
                              onChange={handleDateChange}
                              inputFormat="dd/MM/yyyy"
                              renderInput={(params) => <TextField {...params} variant="standard" helperText="" />}
                            />
                          </LocalizationProvider>
                        </TableCell>
                        
                        <TableCell>
                          <div style={{ display: 'flex', alignItems: 'center', width: '150px', marginRight: '-20px' }}>
                            <span >Fecha de entrega</span>

                          </div><br />
                          <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
                            <DatePicker
                              value={selectedDeliveryDate}
                              onChange={handleDeliveryDateChange}
                              inputFormat="dd/MM/yyyy"
                              renderInput={(params) => <TextField {...params} variant="standard" helperText="" />}
                            />
                          </LocalizationProvider>
                        </TableCell>
                        <TableCell >
                          <Autocomplete
                            value={filterStatus}
                            onChange={(event, newValue) => setFilterStatus(newValue)}
                            options={statusOptions}
                            renderInput={(params) => (
                              <TextField sx={{ width: '150px', marginRight: '-25px' }}
                                {...params}
                                label="Estado"
                                variant="standard"
                              />
                            )}
                          />
                        </TableCell>

                        <TableCell>
                          <TextField sx={{ width: '130px', marginRight: '-20px' }}
                            label="Cantidad"
                            type='number'
                            value={filterCantPieces}
                            onChange={(e) => setFilterCantPieces(e.target.value)}
                          />
                        </TableCell>
                        <TableCell >
                          <Autocomplete
                            value={filterUnitPiece}
                            onChange={(event, newValue) => setFilterUnitPiece(newValue)}
                            options={UMOptions}
                            renderInput={(params) => (
                              <TextField sx={{ width: '120px', marginRight: '-20px' }}
                                {...params}
                                label="U.M"
                                variant="standard"
                              />
                            )}
                          />
                        </TableCell>

                        <TableCell >
                          <Autocomplete
                            value={filterDelivery}
                            onChange={(event, newValue) => setFilterDelivery(newValue)}
                            options={deliveryOptions}
                            renderInput={(params) => (
                              <TextField sx={{ width: '200px', marginRight: '-20px' }}
                                {...params}
                                label="Entrega"
                                variant="standard"
                              />
                            )}
                          />
                        </TableCell>
                       
                        <TableCell>
                          <TextField sx={{ width: '140px', marginRight: '-30px' }}
                            label="Contacto"
                            value={filterContact}
                            onChange={(e) => setFilterContact(e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField sx={{ width: '140px', marginRight: '-30px' }}
                            label="Teléfono"
                            value={filterPhone}
                            onChange={(e) => setFilterPhone(e.target.value)}
                          />
                        </TableCell>

                        <TableCell>
                          <TextField sx={{ width: '140px', marginRight: '-10px' }}
                            label="DNI/RUC"
                            type='number'
                            value={filterIdentification}
                            onChange={(e) => setFilterIdentification(e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            key={resetFilter} // This will force the Autocomplete to re-render when resetFilter changes
                            value={employeeOptions.find((option) => option.id === filterEmployee)}
                            onChange={(event, newValue) => {
                              setFilterEmployee(newValue ? newValue.id : null);
                            }}
                            options={employeeOptions}
                            getOptionLabel={(option) => option.name || ''}
                            renderInput={(params) => (
                              <TextField
                                sx={{ width: '180px' }}
                                {...params}
                                label="Ejecutivo"
                                variant="standard"
                              />
                            )}
                          />
                        </TableCell>
                        {/* <TableCell sx={{ width: '140px' }} style={{ fontSize: '14px', color: 'grey' }}> Acciones</TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {renderTracks(tracks)}
                    </TableBody>

                  </Table>
                </Box>
              </Scrollbar>
              <TablePagination
                component="div"
                count={totalTracks}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage={"Elementos por página"}
              />
            </Card>
            <Dialog open={isDialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
              <DialogTitle style={{ textAlign: 'center' }} >Exportar Pedidos</DialogTitle>
              <DialogContent >
                <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', marginTop: '30px' }}>
                    <DatePicker
                      label="Fecha de inicio *"
                      value={startDate}
                      onChange={handleStartDateChange}
                      inputFormat="dd/MM/yyyy"
                      renderInput={(params) => <TextField {...params} variant="standard" helperText="" />}
                    />
                    <DatePicker
                      label="Fecha de fin *"
                      value={endDate}
                      onChange={handleEndDateChange}
                      inputFormat="dd/MM/yyyy"
                      renderInput={(params) => <TextField {...params} variant="standard" helperText="" />}
                    />
                  </div>
                </LocalizationProvider>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDialogClose} color="error">
                  Cancelar
                </Button>
                <Button onClick={exportReport} color="primary">
                  Exportar
                </Button>
                {loading && (
                  <div
                    style={{
                      position: 'fixed',
                      top: '58%',
                      left: '37%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 9999,
                    }}
                  >
                    <PacmanLoader color={'#ffbe0b'} loading={loading} size={20} />
                  </div>
                )}
              </DialogActions>
            </Dialog>
            <Dialog open={isDialogOpenComment} onClose={handleDialogCommentClose} fullWidth maxWidth="sm">
              <DialogTitle style={{ textAlign: 'center' }}>
                Comentario de el pedido
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={handleDialogCommentClose}
                  aria-label="close"
                  style={{ position: 'absolute', right: '18px', top: '8px' }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <div>
                  <TextareaAutosize
                    disabled={selectedUserId !== sessionStorage.getItem('identificator')}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{
                      width: '100%',
                      height: '300px',
                      padding: '10px',
                      fontSize: '16px',
                      fontFamily: 'sans-serif',
                    }}
                  />
                </div>
              </DialogContent>
              <div hidden={selectedUserId !== sessionStorage.getItem('identificator')}>
                <DialogActions>
                  <Button onClick={handleDialogCommentClose} color="error">
                    Cancelar
                  </Button>
                  <Button onClick={saveComment} color="primary">
                    Guardar
                  </Button>
                </DialogActions>
              </div>
            </Dialog>
          </Stack>
        </Container>
      </Box>
    </>
  );
};



Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
