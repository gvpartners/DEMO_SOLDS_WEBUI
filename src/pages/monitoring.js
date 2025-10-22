import React, { useEffect } from 'react';
import { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import PlusIcon from '@mui/icons-material/Add';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { applyPagination } from 'src/utils/apply-pagination';
import { useRouter } from 'next/router';
import monitoringService from 'src/services/monitoringService';
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
import FileCopyIcon from '@mui/icons-material/FileCopy';
import Swal from 'sweetalert2';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { SeverityPill } from 'src/components/severity-pill';
import { es } from 'date-fns/locale'
import Autocomplete from '@mui/material/Autocomplete';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import uniconJson from 'src/config/unicon.json';
import responsiblesJson from 'src/config/responsibles.json';
import CommentIcon from '@mui/icons-material/Comment';
import { saveAs } from 'file-saver';
import userService from 'src/services/userService';
import CloseIcon from '@mui/icons-material/Close';

// Helper function to get current date/time in Peru timezone
const getPeruTime = () => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "America/Lima" }));
};

// Helper function to check if monitoring belongs to current user
const isMyMonitoring = (monitoringUserId) => {
  const currentUserId = sessionStorage.getItem('identificator');
  return currentUserId && monitoringUserId && currentUserId === monitoringUserId;
};

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

const Page = () => {
  const [orderBy, setOrderBy] = useState('createdOn');
  const [order, setOrder] = useState('asc');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMonitoringId, setSelectedMonitoringId] = useState(null);
  const [selectedStatusNumber, setSelectedStatusNumber] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedMonitoring, setSelectedMonitoring] = useState(null);
  const [monitorings, setMonitorings] = useState([]);
  const [totalMonitorings, setTotalMonitorings] = useState(0);
  const [statusOptions, setStatusOptions] = useState(['En seguimiento', 'Cotizado', 'Cerrado', 'Rechazado']);
  const [categoryOptions, setCategoryOptions] = useState([])
  const [districtOptions, setDistrictOptions] = useState([])
  const [responsibleOptions, setResponsibleOptions] = useState([])
  const [employeeOptions, setEmployeeOptions] = useState([])
  const [segmentOptions, setSegmentOptions] = useState([])

  // Filters Export
  const [categoryValue, setCategoryValue] = useState("");
  const [statusNameValue, setStatusNameValue] = useState("");
  const [districtValue, setDistrictValue] = useState("");
  const [employeeValue, setEmployeeValue] = useState("");

  const [loading, setLoading] = useState(false);
  const [isDialogOpenComment, setIsDialogOpenComment] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedMonitoringForComment, setSelectedMonitoringForComment] = useState(null);

  const router = useRouter();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Column filters
  const [filterCode, setFilterCode] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterContact, setFilterContact] = useState('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterQuantity, setFilterQuantity] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDaysToComplete, setFilterDaysToComplete] = useState('');
  const [filterDeliveryType, setFilterDeliveryType] = useState('');
  const [filterRequirementDate, setFilterRequirementDate] = useState(null);
  const [filterQuotedDate, setFilterQuotedDate] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterResponsible, setFilterResponsible] = useState('');
  const [filterExecutive, setFilterExecutive] = useState('');
  const [filterSegment, setFilterSegment] = useState('');

  // View dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Export dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleDialogClose = () => {
    setStartDate(null);
    setEndDate(null);
    setIsDialogOpen(false);
  };

  // Load categories from unicon.json
  useEffect(() => {
    try {
      const categories = uniconJson
        .map(item => item.Category)
        .filter(category => category && category.trim() !== '') // Filtrar valores undefined o vacíos
        .filter((value, index, self) => self.indexOf(value) === index);
      setCategoryOptions(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategoryOptions([]);
    }
  }, []);

  // Load districts
  useEffect(() => {
    const districts = [
      'Lima', 'Ate', 'Barranco', 'Breña', 'Callao', 'Carabayllo', 'Chaclacayo', 'Chorrillos',
      'Cieneguilla', 'Comas', 'El Agustino', 'Independencia', 'Jesús María', 'La Molina',
      'La Victoria', 'Lince', 'Los Olivos', 'Lurigancho', 'Lurín', 'Magdalena del Mar',
      'Miraflores', 'Pachacámac', 'Pucusana', 'Pueblo Libre', 'Puente Piedra', 'Punta Hermosa',
      'Punta Negra', 'Rímac', 'San Bartolo', 'San Borja', 'San Isidro', 'San Juan de Lurigancho',
      'San Juan de Miraflores', 'San Luis', 'San Martín de Porres', 'San Miguel', 'Santa Anita',
      'Santa María del Mar', 'Santa Rosa', 'Santiago de Surco', 'Surquillo', 'Villa El Salvador',
      'Villa María del Triunfo'
    ];
    setDistrictOptions(districts);
  }, []);

  // Load responsibles from JSON
  useEffect(() => {
    const responsibles = responsiblesJson.map(item => item.name);
    setResponsibleOptions(responsibles);
  }, []);

  // Load segments from responsibles.json
  useEffect(() => {
    const segments = responsiblesJson
      .map(item => item.segment)
      .filter(segment => segment && segment.trim() !== '') // Filter undefined or empty values
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
    setSegmentOptions(segments);
  }, []);

  // Load employees for executive filter
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await userService.getUsers();
        if (response.status === 200) {
          const users = response.data.map(user => `${user.name} ${user.firstLastName}`);
          setEmployeeOptions(users);
        }
      } catch (error) {
        console.error('Error loading employees:', error);
      }
    };
    loadEmployees();
  }, []);

  const loadMonitorings = useCallback(async () => {
    try {
      setLoading(true);
      const monitoringPag = {
        pageNumber: page,
        pageSize: rowsPerPage,
        filters: {
          monitoringCodeFilter: filterCode,
          documentInfoFilter: filterClient,
          contactFilter: filterContact,
          telephoneFilter: filterPhone,
          quantityFilter: filterQuantity,
          selectedDistrictFilter: filterDistrict,
          selectedCategoryFilter: filterCategory,
          daysToCompleteFilter: filterDaysToComplete,
          deliveryTypeFilter: filterDeliveryType,
          statusNameFilter: filterStatus,
          responsibleFilter: filterResponsible,
          executiveFilter: filterExecutive,
          segmentFilter: filterSegment,
          requirementDateFilter: filterRequirementDate,
          quotedDateFilter: filterQuotedDate
        }
      };

      const response = await monitoringService.getAllMonitorings(monitoringPag);
      if (response.status === 200) {
        setMonitorings(response.data.monitorings);
        setTotalMonitorings(response.data.total);
      }
    } catch (error) {
      console.error('Error loading monitorings:', error);
      Swal.fire('Error', 'Error al cargar los seguimientos', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filterCode, filterClient, filterContact, filterPhone, filterQuantity, filterDistrict, filterCategory, filterDaysToComplete, filterDeliveryType, filterStatus, filterResponsible, filterExecutive, filterSegment, filterRequirementDate, filterQuotedDate]);

  useEffect(() => {
    loadMonitorings();
  }, [loadMonitorings]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event, monitoringId, statusNumber, userId) => {
    setAnchorEl(event.currentTarget);
    setSelectedMonitoringId(monitoringId);
    setSelectedStatusNumber(statusNumber);
    setSelectedUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMonitoringId(null);
    setSelectedStatusNumber(null);
    setSelectedUserId(null);
  };

  const handleViewMonitoring = async () => {
    try {
      const response = await monitoringService.getMonitoringById(selectedMonitoringId);
      if (response.status === 200) {
        setSelectedMonitoring(response.data);
        setIsViewDialogOpen(true);
      }
    } catch (error) {
      console.error('Error loading monitoring:', error);
      Swal.fire('Error', 'Error al cargar el seguimiento', 'error');
    }
    handleMenuClose();
  };

  const handleEditMonitoring = () => {
    router.push(`/new-monitoring?MonitoringId=${selectedMonitoringId}`);
    handleMenuClose();
  };

  const handleDeleteMonitoring = async () => {
    handleMenuClose();
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await monitoringService.removeMonitoring(selectedMonitoringId);
        Swal.fire('Eliminado', 'El seguimiento ha sido eliminado', 'success');
        loadMonitorings();
      } catch (error) {
        console.error('Error deleting monitoring:', error);
        Swal.fire('Error', 'Error al eliminar el seguimiento', 'error');
      }
    }
    handleMenuClose();
  };

  const handleStatusChange = async (newStatus) => {
    handleMenuClose();

    const statusMap = {
      'En seguimiento': 1,
      'Cotizado': 2,
      'Cerrado': 3,
      'Rechazado': 4
    };

    try {
      await monitoringService.updateStatus(selectedMonitoringId, statusMap[newStatus]);
      Swal.fire('Actualizado', 'El estado ha sido actualizado', 'success');
      loadMonitorings();
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire('Error', 'Error al actualizar el estado', 'error');
    }
    handleMenuClose();
  };

  const handleDuplicateMonitoring = async () => {
    handleMenuClose();

    const result = await Swal.fire({
      title: 'Confirmar',
      text: '¿Está seguro de duplicar el seguimiento?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, duplicar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        const userId = sessionStorage.getItem('identificator');
        await monitoringService.duplicateMonitoring(selectedMonitoringId, userId);
        Swal.fire({
          title: 'Seguimiento duplicado',
          text: 'Se duplicó satisfactoriamente el seguimiento',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        loadMonitorings();
      } catch (error) {
        console.error('Error al duplicar el seguimiento:', error);
        Swal.fire({
          title: 'Error al duplicar el seguimiento',
          text: 'No se pudo duplicar el seguimiento. Por favor, inténtelo de nuevo.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    }
    handleMenuClose();
  };

  const handleExportExcel = async () => {
    handleMenuClose();

    if (!startDate || !endDate || endDate < startDate) {
      Swal.fire({
        title: 'Corregir fecha',
        text: 'La fecha de fin no puede ser antes a la fecha de inicio',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      setLoading(true);
      const filters = {
        startDate: startDate,
        endDate: endDate
      };

      const response = await monitoringService.generateExcel(filters);

      if (response.ok) {
        const blob = await response.blob();

        // Generar nombre de archivo con fecha y hora de Perú en formato dd/mm/yy HH:mm:ss
        const peruTime = getPeruTime();

        const day = peruTime.getDate().toString().padStart(2, '0');
        const month = (peruTime.getMonth() + 1).toString().padStart(2, '0');
        const year = peruTime.getFullYear().toString().slice(-2);
        const hours = peruTime.getHours().toString().padStart(2, '0');
        const minutes = peruTime.getMinutes().toString().padStart(2, '0');
        const seconds = peruTime.getSeconds().toString().padStart(2, '0');

        const fileName = `Lista de seguimiento ${day}/${month}/${year} ${hours}:${minutes}:${seconds}.xlsx`;

        saveAs(blob, fileName);
        Swal.fire('Éxito', 'Archivo Excel generado correctamente', 'success');
        setIsDialogOpen(false);
      } else {
        Swal.fire('Error', 'Error al generar el archivo Excel', 'error');
      }
    } catch (error) {
      console.error('Error exporting Excel:', error);
      Swal.fire('Error', 'Error al exportar a Excel', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    try {
      setAnchorEl(null);
      await monitoringService.updateCommentbyId(selectedMonitoringForComment, comment);
      Swal.fire('Comentario agregado', 'El comentario ha sido guardado', 'success');
      setIsDialogOpenComment(false);
      setComment('');
      setSelectedMonitoringForComment(null);
      loadMonitorings();
    } catch (error) {
      console.error('Error adding comment:', error);
      Swal.fire('Error', 'Error al agregar el comentario', 'error');
    }
  };

  const handleOpenCommentDialog = async (monitoringId) => {
    try {
      const response = await monitoringService.getCommentById(monitoringId);
      if (response.status === 200) {
        setComment(response.data || '');
        setSelectedMonitoringForComment(monitoringId);
        setIsDialogOpenComment(true);
      }
    } catch (error) {
      console.error('Error loading comment:', error);
      Swal.fire('Error', 'Error al cargar el comentario', 'error');
    }
  };

  const getStatusColor = (status, requirementDate, daysToComplete, quotedDate) => {
    // Check if overdue for all statuses except rejected
    if (requirementDate && daysToComplete > 0 && quotedDate && status !== 'Rechazado') {
      const reqDate = new Date(requirementDate);
      const quotDate = new Date(quotedDate);

      // Convert to Peru timezone and get only the date part (no time)
      const reqDatePeru = new Date(reqDate.toLocaleString("en-US", { timeZone: "America/Lima" }));
      const quotDatePeru = new Date(quotDate.toLocaleString("en-US", { timeZone: "America/Lima" }));

      // Set time to 00:00:00 to compare only dates
      reqDatePeru.setHours(0, 0, 0, 0);
      quotDatePeru.setHours(0, 0, 0, 0);

      const daysElapsed = Math.floor((quotDatePeru - reqDatePeru) / (1000 * 60 * 60 * 24));

      if (daysElapsed > daysToComplete) {
        return 'error'; // Overdue
      }
    }

    switch (status) {
      case 'En seguimiento': return 'warning';
      case 'Cotizado': return 'info';
      case 'Cerrado': return 'success';
      case 'Rechazado': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status, requirementDate, daysToComplete, quotedDate) => {
    // Check if overdue for all statuses except rejected
    if (requirementDate && daysToComplete > 0 && quotedDate && status !== 'Rechazado') {
      const reqDate = new Date(requirementDate);
      const quotDate = new Date(quotedDate);

      // Convert to Peru timezone and get only the date part (no time)
      const reqDatePeru = new Date(reqDate.toLocaleString("en-US", { timeZone: "America/Lima" }));
      const quotDatePeru = new Date(quotDate.toLocaleString("en-US", { timeZone: "America/Lima" }));

      // Set time to 00:00:00 to compare only dates
      reqDatePeru.setHours(0, 0, 0, 0);
      quotDatePeru.setHours(0, 0, 0, 0);

      const daysElapsed = Math.floor((quotDatePeru - reqDatePeru) / (1000 * 60 * 60 * 24));

      if (daysElapsed > daysToComplete) {
        return `${status} - ATRASADO`;
      }
    }
    return status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const calculateDays = (requirementDate, quotedDate) => {
    if (!requirementDate || !quotedDate) return '-';
    const reqDate = new Date(requirementDate);
    const quotDate = new Date(quotedDate);
    const diffTime = Math.abs(quotDate - reqDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'S/ 0.00';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDaysToComplete = (days) => {
    if (!days) return '-';
    return `${days} día${days > 1 ? 's' : ''} (${days * 24} hrs)`;
  };

  const clearFilters = () => {
    setFilterCode('');
    setFilterClient('');
    setFilterContact('');
    setFilterPhone('');
    setFilterQuantity('');
    setFilterDistrict('');
    setFilterCategory('');
    setFilterDaysToComplete('');
    setFilterDeliveryType('');
    setFilterRequirementDate(null);
    setFilterQuotedDate(null);
    setFilterStatus('');
    setFilterResponsible('');
    setFilterExecutive('');
    setFilterSegment('');
  };

  return (
    <>
      <Head>
        <title>Seguimientos</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Typography variant="h4">Total de Seguimientos [{totalMonitorings}]</Typography>
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
                    disabled={loading}
                  >
                    Exportar
                  </Button>
                  <Button
                    onClick={() => router.push('/new-monitoring')}
                    startIcon={
                      <SvgIcon fontSize="small">
                        <PlusIcon />
                      </SvgIcon>
                    }
                    variant="contained"
                  >
                    Nuevo Seguimiento
                  </Button>
                </Stack>
              </Grid>
            </Grid>


            {/* Table */}
            <Card>
              <Scrollbar>
                <Box sx={{ minWidth: 600 }}>
                  <Table sx={{ '& .MuiTableCell-root': { padding: '8px 4px' } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <TextField
                            sx={{ width: '150px' }}
                            label="Código"
                            value={filterCode}
                            onChange={(e) => setFilterCode(e.target.value)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            sx={{ width: '160px' }}
                            label="Cliente"
                            value={filterClient}
                            onChange={(e) => setFilterClient(e.target.value)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            value={filterDeliveryType}
                            onChange={(event, newValue) => setFilterDeliveryType(newValue)}
                            options={['ENTREGADO EN PLANTA', 'PUESTO EN OBRA']}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Tipo Entrega"
                                size="small"
                                sx={{ width: '150px' }}
                              />
                            )}
                            isOptionEqualToValue={(option, value) => option === value}
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            value={filterDistrict}
                            onChange={(event, newValue) => setFilterDistrict(newValue)}
                            options={districtOptions}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Distrito"
                                size="small"
                                sx={{ width: '150px' }}
                              />
                            )}
                            isOptionEqualToValue={(option, value) => option === value}
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            value={filterCategory}
                            onChange={(event, newValue) => setFilterCategory(newValue)}
                            options={categoryOptions}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Categoría"
                                size="small"
                                sx={{ width: '150px' }}
                              />
                            )}
                            getOptionLabel={(option) => option || ''}
                            isOptionEqualToValue={(option, value) => option === value}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            sx={{ width: '130px' }}
                            label="Cantidad"
                            value={filterQuantity}
                            onChange={(e) => setFilterQuantity(e.target.value)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            value={filterSegment}
                            onChange={(event, newValue) => setFilterSegment(newValue)}
                            options={segmentOptions}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Segmento"
                                size="small"
                                sx={{ width: '200px' }}
                              />
                            )}
                            isOptionEqualToValue={(option, value) => option === value}
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            value={filterResponsible}
                            onChange={(event, newValue) => setFilterResponsible(newValue)}
                            options={responsibleOptions}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Responsable"
                                size="small"
                                sx={{ width: '180px' }}
                              />
                            )}
                            isOptionEqualToValue={(option, value) => option === value}
                          />
                        </TableCell>
                        <TableCell align="right"></TableCell>

                        <TableCell>
                          <Autocomplete
                            value={filterStatus}
                            onChange={(event, newValue) => setFilterStatus(newValue)}
                            options={statusOptions}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Estado"
                                size="small"
                                sx={{ width: '150px' }}
                              />
                            )}
                            isOptionEqualToValue={(option, value) => option === value}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            sx={{ width: '130px' }}
                            label="Días"
                            value={filterDaysToComplete}
                            onChange={(e) => setFilterDaysToComplete(e.target.value)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
                            <DatePicker
                              label="F. Requerimiento"
                              value={filterRequirementDate}
                              onChange={(newValue) => setFilterRequirementDate(newValue)}
                              format="dd/MM/yyyy"
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="standard"
                                  helperText=""
                                  sx={{ width: '200px' }}
                                />
                              )}
                            />
                          </LocalizationProvider>
                        </TableCell>
                        <TableCell>
                          <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
                            <DatePicker
                              label="F. Cotizada"
                              value={filterQuotedDate}
                              onChange={(newValue) => setFilterQuotedDate(newValue)}
                              format="dd/MM/yyyy"
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="standard"
                                  helperText=""
                                  sx={{ width: '200px' }}
                                />
                              )}
                            />
                          </LocalizationProvider>
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            value={filterExecutive}
                            onChange={(event, newValue) => setFilterExecutive(newValue)}
                            options={employeeOptions}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Ejecutivo"
                                size="small"
                                sx={{ width: '150px' }}
                              />
                            )}
                            isOptionEqualToValue={(option, value) => option === value}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            sx={{ width: '150px' }}
                            label="Contacto"
                            value={filterContact}
                            onChange={(e) => setFilterContact(e.target.value)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            sx={{ width: '130px' }}
                            label="Teléfono"
                            value={filterPhone}
                            onChange={(e) => setFilterPhone(e.target.value)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={16} align="center">
                            Cargando...
                          </TableCell>
                        </TableRow>
                      ) : monitorings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={16} align="center">
                            No hay seguimientos registrados
                          </TableCell>
                        </TableRow>
                      ) : (
                        monitorings.map((monitoring) => (
                          <TableRow hover key={monitoring.id}>
                            <TableCell>{monitoring.monitoringCode}</TableCell>
                            <TableCell>{monitoring.documentInfo}</TableCell>
                            <TableCell>{monitoring.deliveryType || '-'}</TableCell>
                            <TableCell>{monitoring.selectedDistrict}</TableCell>
                            <TableCell>{monitoring.selectedCategory}</TableCell>
                            <TableCell>{formatCurrency(monitoring.quantity)}</TableCell>
                            <TableCell>{monitoring.segment}</TableCell>
                            <TableCell>{monitoring.responsible}</TableCell>
                            <TableCell align="right">
                              <IconButton
                                onClick={(e) => handleMenuClick(e, monitoring.id, monitoring.statusOrder, monitoring.userId)}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </TableCell>
                            <TableCell>
                              <SeverityPill color={getStatusColor(monitoring.statusName, monitoring.requirementDate, monitoring.daysToComplete, monitoring.quotedDate)}>
                                {getStatusText(monitoring.statusName, monitoring.requirementDate, monitoring.daysToComplete, monitoring.quotedDate)}
                              </SeverityPill>
                            </TableCell>
                            <TableCell>{formatDaysToComplete(monitoring.daysToComplete)}</TableCell>
                            <TableCell>{formatDate(monitoring.requirementDate)}</TableCell>
                            <TableCell>{formatDate(monitoring.quotedDate)}</TableCell>
                            <TableCell>{monitoring.executive}</TableCell>
                            <TableCell>{monitoring.contact}</TableCell>
                            <TableCell>{monitoring.telephone}</TableCell>
                            
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </Scrollbar>
              <TablePagination
                component="div"
                count={totalMonitorings}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </Card>
          </Stack>
        </Container>
      </Box>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewMonitoring}>
          <Visibility sx={{ mr: 1 }} />
          Ver
        </MenuItem>
        <MenuItem onClick={handleDuplicateMonitoring}>
          <FileCopyIcon sx={{ mr: 1 }} />
          Duplicar
        </MenuItem>

        {/* Only show other options if the monitoring belongs to the current user */}
        {isMyMonitoring(selectedUserId) && (
          <>
            <MenuItem onClick={handleEditMonitoring}>
              <EditIcon sx={{ mr: 1 }} />
              Editar
            </MenuItem>
            <MenuItem onClick={() => handleOpenCommentDialog(selectedMonitoringId)}>
              <CommentIcon sx={{ mr: 1 }} />
              Comentario
            </MenuItem>
            <MenuItem onClick={() => handleStatusChange('Cerrado')}>
              <CheckCircle sx={{ mr: 1 }} />
              Marcar como Cerrado
            </MenuItem>
            <MenuItem onClick={handleDeleteMonitoring}>
              <DeleteIcon sx={{ mr: 1 }} />
              Eliminar
            </MenuItem>
          </>
        )}
      </Menu>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onClose={() => setIsViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Detalles del Seguimiento
          <IconButton
            onClick={() => setIsViewDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedMonitoring && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Código:</Typography>
                  <Typography>{selectedMonitoring.monitoringCode}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Cliente:</Typography>
                  <Typography>{selectedMonitoring.documentInfo}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Cantidad:</Typography>
                  <Typography>{formatCurrency(selectedMonitoring.quantity)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Tipo de Entrega:</Typography>
                  <Typography>{selectedMonitoring.deliveryType || 'No especificado'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Distrito:</Typography>
                  <Typography>{selectedMonitoring.selectedDistrict}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Categoría:</Typography>
                  <Typography>{selectedMonitoring.selectedCategory}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Días para completar:</Typography>
                  <Typography>{formatDaysToComplete(selectedMonitoring.daysToComplete)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">F. Requerimiento:</Typography>
                  <Typography>{formatDate(selectedMonitoring.requirementDate)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">F. Cotizada:</Typography>
                  <Typography>{formatDate(selectedMonitoring.quotedDate)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Estado:</Typography>
                  <SeverityPill color={getStatusColor(selectedMonitoring.statusName)}>
                    {selectedMonitoring.statusName}
                  </SeverityPill>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Segmento:</Typography>
                  <Typography>{selectedMonitoring.segment}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Responsable:</Typography>
                  <Typography>{selectedMonitoring.responsible}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Ejecutivo:</Typography>
                  <Typography>{selectedMonitoring.executive}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Contacto:</Typography>
                  <Typography>{selectedMonitoring.contact}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Teléfono:</Typography>
                  <Typography>{selectedMonitoring.telephone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">RUC/DNI:</Typography>
                  <Typography>{selectedMonitoring.identificationInfo}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Email:</Typography>
                  <Typography>{selectedMonitoring.email}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Comentario:</Typography>
                  <Typography>{selectedMonitoring.comment || 'Sin comentarios'}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog open={isDialogOpenComment} onClose={() => setIsDialogOpenComment(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Agregar Comentario
          <IconButton
            onClick={() => setIsDialogOpenComment(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextareaAutosize
            minRows={4}
            placeholder="Escribe tu comentario aquí..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ width: '100%', marginTop: 16 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpenComment(false)}>Cancelar</Button>
          <Button onClick={handleAddComment} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isDialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle style={{ textAlign: 'center' }}>Exportar seguimientos</DialogTitle>
        <DialogContent>
          <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', marginTop: '30px' }}>
              <DatePicker
                label="Fecha de inicio *"
                value={startDate}
                onChange={handleStartDateChange}
                format="dd/MM/yyyy"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    helperText=""
                    sx={{ width: '200px' }}
                  />
                )}
              />
              <DatePicker
                label="Fecha de fin *"
                value={endDate}
                onChange={handleEndDateChange}
                format="dd/MM/yyyy"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    helperText=""
                    sx={{ width: '200px' }}
                  />
                )}
              />
            </div>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancelar</Button>
          <Button onClick={handleExportExcel} variant="contained" disabled={loading}>
            {loading ? 'Exportando...' : 'Exportar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
