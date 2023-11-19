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
  TextareaAutosize
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

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
  const [statusOptions, setstatusOptions] = useState(['En progreso', 'Aprobada', 'Rechazada']);
  const [categoryOptions, setCategoryOptions] = useState([])
  const [UMOptions, setUMOptions] = useState(['MT2', 'PZA'])
  const [deliveryOptions, setdeliveryOptions] = useState(['Puesto en planta', 'Puesto en obra']);
  const [districtOptions, setDistrictOptions] = useState([])

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
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterCantPieces, setFilterCantPieces] = useState('');
  const [filterUnitPiece, setFilterUnitPiece] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterAddress, setFilterAddress] = useState('');
  const [filterReference, setFilterReference] = useState('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterContact, setFilterContact] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const getInvoices = async () => {
    try {
      var invoicePag = {
        pageNumber: page,
        pageSize: rowsPerPage,
        filterColumn: '',
        filterValue: ''
      }
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

  useEffect(() => {
    const uniqueCategories = Array.from(new Set(uniconJson.map(item => item.Category)));
    setCategoryOptions(uniqueCategories);
    const districtOpt = fletesJson.map((district) => district.District);
    setDistrictOptions(districtOpt);

  }, []);

  
  const handleNewInvoice = () => {
    router.push('/new-invoice')
  }

  useEffect(() => {
    getInvoices();
  }, [page, rowsPerPage]);

  const handlePageChange = useCallback((event,newPage) => {
    setPage(newPage);
  },[setPage]);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  },[setRowsPerPage,setPage]);



  const handleFilterEmployeeChange = (event) => {
    setFilterEmployee(event.target.value);
  };

  const handleFilterCodeChange = (event) => {
    setFilterCode(event.target.value);
  };

  const handleMenuClick = (event, invoice) => {
    setSelectedInvoice(invoice);
    setSelectedInvoiceId(invoice.id);
    setSelectedStatusNumber(invoice.statusOrder);
    setSelectedUserId(invoice.userId);
    setAnchorEl(event.currentTarget);
  };

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
    "PUESTO EN PLANTA": 'primary',
    "PUESTO EN OBRA": 'info'
  };
  const editInvoice = () => {
    if (selectedInvoiceId) {
      router.push(`/new-invoice?InvoiceId=${selectedInvoiceId}`);
    }
  };
  const duplicateInvoice = async () => {
    // Cierra el menú contextual si está abierto
    setAnchorEl(null);

    // Pregunta al usuario para confirmar la acción
    const confirmAction = await Swal.fire({
      title: 'Confirmar',
      text: '¿Está seguro de duplicar la cotización?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, duplicar',
      cancelButtonText: 'Cancelar',
    });

    // Si el usuario confirma, intenta duplicar la factura utilizando el servicio correspondiente
    if (confirmAction.isConfirmed) {
      try {
        await invoiceService.duplicateInvoice(selectedInvoiceId);

        // Muestra un mensaje de éxito al usuario
        Swal.fire({
          title: 'Cotización duplicada',
          text: 'Se duplicó satisfactoriamente la cotización',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        getInvoices();
      } catch (error) {
        // Si hay un error al duplicar la factura, muestra un mensaje de error
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

      // Verificar si el usuario confirmó la acción
      if (confirmAction.isConfirmed) {
        const response = await invoiceService.updateStatus(selectedInvoiceId, orderStatus);

        if (response.status == 200) {
          setAnchorEl(null);
          if (orderStatus === 2) {
            Swal.fire({
              title: 'Cotización aprobada',
              text: 'Se aprobó satisfactoriamente la cotización',
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
          getInvoices();
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
          getInvoices();
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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleIconClick = () => {
    setIsDatePickerOpen(!isDatePickerOpen);
  };

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
      // Mostrar mensaje de advertencia con Swal
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
      const response = await invoiceService.generateExcel(dataExport);
      if (!response.ok) {
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
    }
    setIsDialogOpen(false);
  };

  const renderInvoices = (inv)=>{
   return  inv.map((invoice) => {
    const adjustedDate = new Date(invoice.createdOn);

    const formattedDate = adjustedDate.toLocaleString('es-PE', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    return (
      <TableRow hover key={invoice.id}>
        <TableCell>{invoice.invoiceCode}</TableCell>
        <TableCell>{invoice.identificationInfo}</TableCell>
        <TableCell>{invoice.documentInfo}</TableCell>
        <TableCell>
          <SeverityPill color='primary'>
            {invoice.selectedCategory}
          </SeverityPill>
        </TableCell>
        <TableCell>
          <SeverityPill color={statusMap[invoice.statusOrder]}>
            {invoice.statusName}
          </SeverityPill>
        </TableCell>
        <TableCell>{formattedDate}</TableCell>
        <TableCell>{new Intl.NumberFormat('en-US').format(invoice.totalOfPieces)}</TableCell>
        <TableCell>{invoice.unitPiece}</TableCell>
        <TableCell>
          {formatter.format(invoice.totalInvoice)}
        </TableCell>
        <TableCell>
          <SeverityPill color={statusMap[invoice.deliveryType]}>
            {invoice.deliveryType}
          </SeverityPill>
        </TableCell>
        <TableCell>{invoice.selectedDistrict}</TableCell>
        <TableCell>{invoice.reference || "No proporcionado"}</TableCell>
        <TableCell>{invoice.address}</TableCell>
        <TableCell>{invoice.employee}</TableCell>
        <TableCell>{invoice.telephone || "No proporcionado"}</TableCell>
        <TableCell>{invoice.contact || "No proporcionado"}</TableCell>
        <TableCell>
          <IconButton onClick={(event) => handleMenuClick(event, invoice)}>
            <MoreVertIcon />
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <div hidden={selectedUserId !== sessionStorage.getItem('identificator')}>
              <div hidden={selectedStatusNumber !== 1}>
                <MenuItem style={{ marginRight: '8px', color: 'green' }} onClick={() => updateStatus(2)}>
                  <CheckCircle style={{ marginRight: '8px' }} /> Aprobar
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
            <div hidden={selectedStatusNumber === 1 || selectedStatusNumber === 3}>
              <MenuItem style={{ marginRight: '8px', color: 'red' }} onClick={() => updateStatus(3)}>
                <Close style={{ marginRight: '8px' }} /> Rechazar
              </MenuItem>
            </div>
            <div hidden={selectedUserId !== sessionStorage.getItem('identificator')}>
              <MenuItem onClick={() => duplicateInvoice()} style={{ display: 'flex', alignItems: 'center' }}>
                <FileCopyIcon style={{ marginRight: '8px' }} /> Duplicar
              </MenuItem>
            </div>
            <div hidden={selectedUserId !== sessionStorage.getItem('identificator')}>
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

        </TableCell>
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
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={4}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h4">Total de cotizaciones [{totalInvoices}]</Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  startIcon={<SvgIcon fontSize="small"><ArrowDownOnSquareIcon /></SvgIcon>}
                  variant="contained"
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
                  variant="contained"
                >
                  Añadir nueva cotización
                </Button>
              </Stack>
            </Stack>

            <Card>
              <Scrollbar>
                <Box sx={{ minWidth: 800 }}>
                  <br />
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <TextField sx={{ width: '150px' }}
                            label="Código"
                            value={filterCode}
                            onChange={(e) => setFilterCode(e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField sx={{ width: '200px' }}
                            label="Cliente"
                            value={filterClient}
                            onChange={(e) => setFilterClient(e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField sx={{ width: '120px' }}
                            label="Dni o RUC"
                            value={filterIdentification}
                            onChange={(e) => setFilterIdentification(e.target.value)}
                          />
                        </TableCell>
                        <TableCell >
                          <Autocomplete
                            value={filterCategory}
                            onChange={(event, newValue) => setFilterCategory(newValue)}
                            options={categoryOptions}
                            renderInput={(params) => (
                              <TextField sx={{ width: '200px' }}
                                {...params}
                                label="Categoria"
                                variant="standard"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell >
                          <Autocomplete
                            value={filterStatus}
                            onChange={(event, newValue) => setFilterStatus(newValue)}
                            options={statusOptions}
                            renderInput={(params) => (
                              <TextField sx={{ width: '150px' }}
                                {...params}
                                label="Estado"
                                variant="standard"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', alignItems: 'center', width: '170px' }}>
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
                        <TableCell>
                          <TextField sx={{ width: '150px' }}
                            label="Cantidad"
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
                              <TextField sx={{ width: '120px' }}
                                {...params}
                                label="U.M"
                                variant="standard"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField sx={{ width: '150px' }}
                            label="Precio total"
                            value={filterPrice}
                            onChange={(e) => setFilterPrice(e.target.value)}
                          />
                        </TableCell>
                        <TableCell >
                          <Autocomplete
                            value={filterDelivery}
                            onChange={(event, newValue) => setFilterDelivery(newValue)}
                            options={deliveryOptions}
                            renderInput={(params) => (
                              <TextField sx={{ width: '200px' }}
                                {...params}
                                label="Entrega"
                                variant="standard"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell >
                          <Autocomplete
                            value={filterDistrict}
                            onChange={(event, newValue) => setFilterDistrict(newValue)}
                            options={districtOptions}
                            renderInput={(params) => (
                              <TextField sx={{ width: '200px' }}
                                {...params}
                                label="Distrito"
                                variant="standard"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField sx={{ width: '240px' }}
                            label="Referencia"
                            value={filterReference}
                            onChange={(e) => setFilterReference(e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField sx={{ width: '240px' }}
                            label="Dirección"
                            value={filterAddress}
                            onChange={(e) => setFilterAddress(e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField sx={{ width: '140px' }}
                            label="Ejecutivo"
                            value={filterEmployee}
                            onChange={(e) => setFilterEmployee(e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField sx={{ width: '140px' }}
                            label="Telefono"
                            value={filterPhone}
                            onChange={(e) => setFilterPhone(e.target.value)}
                          />
                        </TableCell><TableCell>
                          <TextField sx={{ width: '140px' }}
                            label="Contacto"
                            value={filterContact}
                            onChange={(e) => setFilterContact(e.target.value)}
                          />
                        </TableCell>
                        <TableCell sx={{ width: '140px' }} style={{ fontSize: '14px', color: 'grey' }}> Acciones</TableCell>
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
                  {/* <TextField
                    label="Categoria"
                    value={categoryValue}
                    onChange={(e) => setCategoryValue(e.target.value)}
                    variant="standard"
                    fullWidth
                    style={{ marginBottom: '20px' }}
                  />

                  <Autocomplete
                    value={statusNameValue}
                    options={statusOptions}
                    onChange={(event, newValue) => {
                      setStatusNameValue(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Estado"
                        variant="standard"
                        style={{ marginBottom: '20px' }}
                      />
                    )}
                  />

                  <Autocomplete
                    value={deliveryTypeValue}
                    options={deliveryOptions}
                    onChange={(event, newValue) => {
                      setDeliveryTypeValue(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tipo de entrega"
                        variant="standard"
                        style={{ marginBottom: '20px' }}
                      />
                    )}
                  />
                  <TextField
                    label="Distrito"
                    value={districtValue}
                    onChange={(e) => setDistrictValue(e.target.value)}
                    variant="standard"
                    fullWidth
                    style={{ marginBottom: '20px' }}
                  />
                  <TextField
                    label="Ejecutivo"
                    value={employeeValue}
                    onChange={(e) => setEmployeeValue(e.target.value)}
                    variant="standard"
                    fullWidth
                    style={{ marginBottom: '20px' }}
                  /> */}
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
              </DialogActions>
            </Dialog>
            <Dialog open={isDialogOpenComment} onClose={handleDialogCommentClose} fullWidth maxWidth="sm">
              <DialogTitle style={{ textAlign: 'center' }}>Comentario de la cotización</DialogTitle>
              <DialogContent>
                <div>
                  <TextareaAutosize
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
              <DialogActions>
                <Button onClick={handleDialogCommentClose} color="error">
                  Cancelar
                </Button>
                <Button onClick={saveComment} color="primary">
                  Guardar
                </Button>
              </DialogActions>
            </Dialog>

          </Stack>
        </Container>
      </Box>
    </>
  );
};



Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
