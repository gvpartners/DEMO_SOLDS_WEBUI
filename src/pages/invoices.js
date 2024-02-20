import React, { useEffect } from 'react';
import { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import PlusIcon from '@mui/icons-material/Add';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { applyPagination } from 'src/utils/apply-pagination';
import { useRouter } from 'next/router';
import invoiceService from 'src/services/invoiceService';
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
import handleDownloadPDFInvoice from 'src/sections/invoices/invoice-pdf';
import PDFPreview from 'src/sections/invoices/invoice-preview';
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
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [selectedStatusNumber, setSelectedStatusNumber] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusOptions, setstatusOptions] = useState(['En progreso', 'Cerrada', 'Rechazada']);
  const [categoryOptions, setCategoryOptions] = useState([])
  const [UMOptions, setUMOptions] = useState(['MT2', 'PZA', 'MLL'])
  const [deliveryOptions, setdeliveryOptions] = useState(['Entregado en planta', 'Puesto en obra']);
  const [districtOptions, setDistrictOptions] = useState([])
  const [employeeOptions, setEmployeeOptions] = useState([])
  // Filters Export
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [categoryValue, setCategoryValue] = useState("");
  const [statusNameValue, setStatusNameValue] = useState("");
  const [deliveryTypeValue, setDeliveryTypeValue] = useState("");
  const [districtValue, setDistrictValue] = useState("");
  const [employeeValue, setEmployeeValue] = useState("");

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
      const response = await invoiceService.getCommentById(selectedInvoiceId);
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [resetFilter, setResetFilter] = useState(false);

  const getInvoices = async () => {
    try {
      var invoicePag = {
        pageNumber: page,
        pageSize: rowsPerPage,
        filters: {
          invoiceCodeFilter: filterCode,
          identificationInfoFilter: filterClient,
          selectedCategoryFilter: filterCategory,
          identificationTypeFilter: filterIdentification,
          totalInvoiceFilter: filterPrice,
          deliveryTypeFilter: filterDelivery,
          employeeFilter: filterEmployee,
          statusNameFilter: filterStatus,
          totalOfPieces: filterCantPieces,
          unitPieceFilter: filterUnitPiece,
          selectedDistrictFilter: filterDistrict,
          addressFilter: filterAddress,
          referenceFilter: filterReference,
          telephoneFilter: filterPhone,
          contactFilter: filterContact,
          invoiceDate: selectedDate
        }
      };
      const response = await invoiceService.getAllInvoices(invoicePag);

      if (response.status == 200) {
        const fetchedData = await response.data;
        setTotalInvoices(fetchedData.total)
        setInvoices(fetchedData.invoices);
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
    getInvoices();
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


  const handleNewInvoice = () => {
    router.push('/new-invoice')
  }

  useEffect(() => {
    getInvoices();
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
    selectedDate
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
  const getEmployeePhone = (invoice) => {
    const matchingEmployee = employeeOptions?.find(x => x.email === invoice.createdBy);

    if (matchingEmployee && matchingEmployee.phone) {
      setEmployeePhone(matchingEmployee.phone);
      setSelectedInvoice(prevInvoice => ({
        ...prevInvoice,
        employeePhone: matchingEmployee.phone
      }));
    }
  }
  const handleMenuClick = (event, invoice) => {
    setSelectedInvoice(invoice);
    setSelectedInvoiceId(invoice.id);
    setSelectedStatusNumber(invoice.statusOrder);
    setSelectedUserId(invoice.userId);
    getCustomerAddress(invoice.documentInfo);
    getEmployeePhone(invoice);
    setAnchorEl(event.currentTarget);
  };

  useEffect(() => {
    // This code will run when customerAddress is updated
    setSelectedInvoice(prevInvoice => ({
      ...prevInvoice,
      customerAddress: customerAddress
    }));
  }, [customerAddress]);




  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDownloadPDF = () => {
    if (selectedInvoice) {
      handleDownloadPDFInvoice(selectedInvoice);
    }
  };
  const handlePreviewPDF = () => {
    if (selectedInvoice) {
      PDFPreview(selectedInvoice);
    }
  };

  const statusMap = {
    1: 'warning',
    2: 'success',
    3: 'error',
    "ENTREGADO EN PLANTA": 'primary',
    "PUESTO EN OBRA": 'info'
  };
  const editInvoice = () => {
    if (selectedInvoiceId) {
      router.push(`/new-invoice?InvoiceId=${selectedInvoiceId}`);
    }
  };
  const duplicateInvoice = async () => {
    setAnchorEl(null);
    const confirmAction = await Swal.fire({
      title: 'Confirmar',
      text: '¿Está seguro de duplicar la cotización?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, duplicar',
      cancelButtonText: 'Cancelar',
    });

    if (confirmAction.isConfirmed) {
      try {
        await invoiceService.duplicateInvoice(selectedInvoiceId);
        Swal.fire({
          title: 'Cotización duplicada',
          text: 'Se duplicó satisfactoriamente la cotización',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        getInvoices();
      } catch (error) {
        console.error('Error al duplicar la cotización:', error);
        Swal.fire({
          title: 'Error al duplicar la cotización',
          text: 'No se pudo duplicar la cotización. Por favor, inténtelo de nuevo.',
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
        const response = await invoiceService.updateStatus(selectedInvoiceId, orderStatus);

        if (response.status == 200) {
          setAnchorEl(null);
          if (orderStatus === 2) {
            Swal.fire({
              title: 'Cotización cerrada',
              text: 'Se cerró satisfactoriamente la cotización',
              icon: 'success',
              confirmButtonText: 'OK',
            });
          } else if (orderStatus === 3) {
            Swal.fire({
              title: 'Cotización rechazada',
              text: 'Se rechazó satisfactoriamente la cotización',
              icon: 'success',
              confirmButtonText: 'OK',
            });
          } else {
            Swal.fire({
              title: 'Error',
              text: error.message || 'Hubo un error al actualizar el estado de la cotización',
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
        text: error.message || 'Hubo un error al actualizar el estado de la cotización',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };


  const removeInvoice = async () => {
    try {
      setAnchorEl(null);
      const confirmAction = await Swal.fire({
        title: 'Confirmar eliminación',
        text: '¿Está seguro de eliminar esta cotización?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });

      if (confirmAction.isConfirmed) {
        const response = await invoiceService.removeInvoice(selectedInvoiceId);

        if (response.status == 200) {
          setAnchorEl(null);
          Swal.fire({
            title: 'Eliminación de Cotización',
            text: 'Se eliminó satisfactoriamente la cotización',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          clearFilters();
        } else {
          Swal.fire({
            title: 'Error',
            text: error.message || 'Hubo un error al eliminar la cotización',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.message || 'Hubo un error al eliminar la cotización',
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

    const response = await invoiceService.updateCommentbyId(selectedInvoiceId, comment);
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
      const response = await invoiceService.generateExcel(dataExport);
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
      saveAs(blob, 'Reporte de cotizaciones_' + date + '.xlsx');
      setLoading(false);
    }
    setIsDialogOpen(false);
  };

  const renderInvoices = (inv) => {
    return inv.map((invoice) => {
      const adjustedDate = new Date(invoice.createdOn);

      const formattedDate = adjustedDate.toLocaleString('es-PE', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        // hour: '2-digit',
        // minute: '2-digit',
        // second: '2-digit'
      });

      return (
        <TableRow hover key={invoice.id}>
          <TableCell>{invoice.invoiceCode}</TableCell>
          <TableCell>{invoice.identificationInfo || "No proporcionado"}</TableCell>
          <TableCell>{invoice.selectedDistrict}</TableCell>
          <TableCell>
            <SeverityPill color='primary'>
              {invoice.selectedCategory}
            </SeverityPill>
          </TableCell>
          <TableCell>{formattedDate}</TableCell>
          <TableCell>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <SeverityPill color={statusMap[invoice.statusOrder]}>
                  {invoice.statusName}
                </SeverityPill>
              </div>
              <div>
                <IconButton onClick={(event) => handleMenuClick(event, invoice)}>
                  <MoreVertIcon />
                </IconButton>

                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                  <div hidden={selectedUserId !== sessionStorage.getItem('identificator')}>
                    <div hidden={selectedStatusNumber !== 1}>
                      <MenuItem style={{ marginRight: '8px', color: 'green' }} onClick={() => updateStatus(2)}>
                        <CheckCircle style={{ marginRight: '8px' }} /> Cerrar
                      </MenuItem>
                      <MenuItem style={{ marginRight: '8px', color: 'red' }} onClick={() => updateStatus(3)}>
                        <Close style={{ marginRight: '8px' }} /> Rechazar
                      </MenuItem>
                      <MenuItem onClick={() => editInvoice()} style={{ display: 'flex', alignItems: 'center' }}>
                        <EditIcon style={{ marginRight: '8px' }} /> Editar
                      </MenuItem>
                      <MenuItem onClick={() => removeInvoice()} style={{ display: 'flex', alignItems: 'center' }}>
                        <DeleteIcon style={{ marginRight: '8px' }} /> Eliminar
                      </MenuItem>
                    </div>
                  </div>
                  <div hidden={selectedStatusNumber === 1 || selectedStatusNumber === 3 || selectedUserId !== sessionStorage.getItem('identificator')}>
                    <MenuItem style={{ marginRight: '8px', color: 'red' }} onClick={() => updateStatus(3)}>
                      <Close style={{ marginRight: '8px' }} /> Rechazar
                    </MenuItem>
                  </div>
                  <div hidden={selectedUserId !== sessionStorage.getItem('identificator')}>
                    <MenuItem onClick={() => duplicateInvoice()} style={{ display: 'flex', alignItems: 'center' }}>
                      <FileCopyIcon style={{ marginRight: '8px' }} /> Duplicar
                    </MenuItem>
                  </div>
                  <div>
                    <MenuItem onClick={() => getCommentById()} style={{ display: 'flex', alignItems: 'center' }}>
                      <CommentIcon style={{ marginRight: '8px' }} /> Comentario
                    </MenuItem>
                  </div>
                  <MenuItem onClick={() => handlePreviewPDF()} style={{ display: 'flex', alignItems: 'center' }}>
                    <Visibility style={{ marginRight: '8px' }} /> Ver PDF
                  </MenuItem>
                  <MenuItem onClick={() => handleDownloadPDF()} style={{ display: 'flex', alignItems: 'center' }}>
                    <GetAppIcon style={{ marginRight: '8px' }} /> Descargar PDF
                  </MenuItem>
                </Menu>
              </div>
            </div>
          </TableCell>

          <TableCell>{new Intl.NumberFormat('en-US').format(invoice.totalOfPieces)}</TableCell>
          <TableCell>{invoice.unitPiece}</TableCell>

          <TableCell>
            <SeverityPill color={statusMap[invoice.deliveryType]}>
              {invoice.deliveryType}
            </SeverityPill>
          </TableCell>
          <TableCell>
            {formatter.format(invoice.totalInvoice)}
          </TableCell>
          {/* <TableCell>{invoice.reference || "No proporcionado"}</TableCell> */}
          <TableCell>{invoice.address}</TableCell>
          <TableCell>{invoice.contact || "No proporcionado"}</TableCell>
          <TableCell>{invoice.telephone || "No proporcionado"}</TableCell>
          <TableCell>{invoice.documentInfo || "XXXXXXXXXX"}</TableCell>
          <TableCell>{invoice.employee}</TableCell>

        </TableRow>
      );
    });
  }

  return (
    <>
      <Head>
        <title>Cotizaciones</title>
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
                  <Typography variant="h4">Total de cotizaciones [{new Intl.NumberFormat('en-US').format(totalInvoices)}]</Typography>
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
                    onClick={handleNewInvoice}
                    startIcon={
                      <SvgIcon fontSize="small">
                        <PlusIcon />
                      </SvgIcon>
                    }
                    variant="outlined"
                  >
                    Nueva cotización
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
                            value={filterDistrict}
                            onChange={(event, newValue) => setFilterDistrict(newValue)}
                            options={districtOptions}
                            renderInput={(params) => (
                              <TextField sx={{ width: '160px', marginRight: '-10px' }}
                                {...params}
                                label="Distrito"
                                variant="standard"
                              />
                            )}
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
                            <span >Fecha de cotización</span>

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
                          <TextField sx={{ width: '150px', marginRight: '-30px' }}
                            type='number'
                            label="Precio total"
                            value={filterPrice}
                            onChange={(e) => setFilterPrice(e.target.value)}
                          />
                        </TableCell>
                        {/* <TableCell>
                          <TextField sx={{ width: '240px' }}
                            label="Referencia"
                            value={filterReference}
                            onChange={(e) => setFilterReference(e.target.value)}
                          />
                        </TableCell> */}
                        <TableCell>
                          <TextField sx={{ width: '240px', marginRight: '-30px' }}
                            label="Dirección"
                            value={filterAddress}
                            onChange={(e) => setFilterAddress(e.target.value)}
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
                          <TextField sx={{ width: '140px', marginRight: '-30px' }}
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
                      {renderInvoices(invoices)}
                    </TableBody>

                  </Table>
                </Box>
              </Scrollbar>
              <TablePagination
                component="div"
                count={totalInvoices}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage={"Elementos por página"}
              />
            </Card>
            <Dialog open={isDialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
              <DialogTitle style={{ textAlign: 'center' }} >Exportar cotizaciones</DialogTitle>
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
                Comentario de la cotización
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
