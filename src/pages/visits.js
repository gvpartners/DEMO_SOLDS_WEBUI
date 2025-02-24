import React, { useEffect } from 'react';
import { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import PlusIcon from '@mui/icons-material/Add';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { useRouter } from 'next/router';
import visitService from 'src/services/visitService';
import TextField from '@mui/material/TextField';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { es } from 'date-fns/locale';
import Autocomplete from '@mui/material/Autocomplete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import uniconJson from 'src/config/unicon.json';
import Divider from '@mui/material/Divider'; // Importa el componente Divider
import { saveAs } from 'file-saver';
import IconButton from '@mui/material/IconButton';
import userService from 'src/services/userService';
import EmailIcon from '@mui/icons-material/Email';
import CommentIcon from '@mui/icons-material/Comment';
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
  TextareaAutosize,
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import customerService from 'src/services/customerService';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Swal from 'sweetalert2';

const Page = () => {
  const [orderBy, setOrderBy] = useState('createdOn');
  const [order, setOrder] = useState('asc');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [selectedStatusNumber, setSelectedStatusNumber] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [visits, setVisits] = useState([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusOptions, setStatusOptions] = useState(['En progreso', 'Atendido', 'Rechazada']);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [UMOptions, setUMOptions] = useState(['MT2', 'PZA', 'MLL']);
  const [deliveryOptions, setDeliveryOptions] = useState(['Entregado en planta', 'Puesto en obra']);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDialogOpenComment, setIsDialogOpenComment] = useState(false);
  const [comment, setComment] = useState('');
  const [isDialogOpenEmail, setIsDialogOpenEmail] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [openLinkDialog, setOpenLinkDialog] = useState(false);
  const userId = sessionStorage.getItem('identificator');
  const [requestLink, setRequestLink] = useState(`https://unicon-bloques-app.vercel.app/auth/new-visit?userId=${userId}`);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  // Abrir el diálogo del enlace
  const handleOpenLinkDialog = () => {
    setRequestLink(requestLink);
    setOpenLinkDialog(true);
  };

  const handleCloseLinkDialog = () => {
    setOpenLinkDialog(false);
    setCopied(false);
  };

  const handleCopyLink = () => {
    const textToCopy = `Estimado cliente, le comparto el siguiente link para que solicite su visita:\n\n${requestLink}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtros
  const [filterCode, setFilterCode] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterWork, setFilterWork] = useState('');
  const [filterWorkAddress, setFilterWorkAddress] = useState('');
  const [filterStatusName, setFilterStatusName] = useState('');
  const [filterContacts, setFilterContacts] = useState('');
  const [filterVisitReason, setFilterVisitReason] = useState('');
  const [filterCreatedBy, setFilterCreatedBy] = useState('');
  const [selectedCreatedOn, setSelectedCreatedOn] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [resetFilter, setResetFilter] = useState(false);
  const [isDialogOpenEdit, setIsDialogOpenEdit] = useState(false);
  const [editVisitData, setEditVisitData] = useState({
    client: '',
    work: '',
    workAddress: '',
    contacts: [],
    visitReason: '',
  });
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleRemoveVisit = async () => {
    try {
      setAnchorEl(null);
      const confirmAction = await Swal.fire({
        title: 'Confirmar eliminación',
        text: '¿Está seguro de eliminar esta visita?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });

      if (confirmAction.isConfirmed) {
        const response = await visitService.removeVisit(selectedVisitId);

        if (response.status == 200) {
          setAnchorEl(null);
          Swal.fire({
            title: 'Eliminación de visita',
            text: 'Se eliminó satisfactoriamente la visita',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          clearFilters();
        } else {
          Swal.fire({
            title: 'Error',
            text: error.message || 'Hubo un error al eliminar la visita',
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
  // Obtener visitas
  const getVisits = async () => {
    try {
      const visitPag = {
        PageNumber: page,
        PageSize: rowsPerPage,
        Filters: {
          VisitCodeFilter: filterCode || null,
          ClientFilter: filterClient || null,
          WorkFilter: filterWork || null,
          WorkAddressFilter: filterWorkAddress || null,
          ContactsFilter: filterContacts || null,
          VisitReasonFilter: filterVisitReason || null,
          CreatedByFilter: filterCreatedBy || null,
          CreatedOnFilter: selectedCreatedOn || null,
          StatusNameFilter: filterStatusName || null,
        },
      };

      const response = await visitService.getAllVisits(visitPag);

      if (response.status === 200) {
        const fetchedData = await response.data;
        setTotalVisits(fetchedData.total);
        setVisits(fetchedData.visits);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilterCode('');
    setFilterClient('');
    setFilterWork('');
    setFilterWorkAddress('');
    setFilterContacts('');
    setFilterVisitReason('');
    setFilterCreatedBy('');
    setFilterStatusName('');
    setSelectedCreatedOn(null);
    setResetFilter((prev) => !prev);
    getVisits();
  };

  // Obtener usuarios
  const getUsers = async () => {
    try {
      const response = await userService.getUsers();

      if (response.status === 200) {
        const fetchedData = await response.data;

        const employeeData = fetchedData.map((user) => ({
          id: user.id,
          name: `${user.name} ${user.firstLastName}`,
          email: user.email,
          phone: user.phone,
        }));

        setEmployeeOptions(employeeData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleMenuClick = (event, visit) => {
    setSelectedVisitId(visit.id);
    setSelectedStatusNumber(visit.statusOrder);
    setAnchorEl(event.currentTarget);
  };

  // Efecto para obtener visitas y usuarios
  useEffect(() => {
    getVisits();
    getUsers();
  }, [
    page,
    rowsPerPage,
    filterCode,
    filterClient,
    filterWork,
    filterWorkAddress,
    filterContacts,
    filterVisitReason,
    filterCreatedBy,
    selectedCreatedOn,
    filterStatusName
  ]);
  const statusMap = {
    1: 'warning', // En progreso
    2: 'success', // Atendido
    3: 'error'    // Rechazado
  };

  const SeverityPill = ({ color, children }) => (
    <Box
      sx={{
        backgroundColor: color === 'success' ? '#4CAF50' :
          color === 'warning' ? '#FF9300' :
            color === 'error' ? '#F44336' : '#9E9E9E',
        borderRadius: '12px',
        color: '#FFFFFF',
        fontSize: '12px',
        fontWeight: '600',
        padding: '4px 8px',
        display: 'inline-block'
      }}
    >
      {children}
    </Box>
  );
  const handleEditVisit = (visitId) => {
    const selectedVisit = visits.find(visit => visit.id === visitId);
    if (selectedVisit) {
      setEditVisitData({
        client: selectedVisit.client,
        work: selectedVisit.work,
        workAddress: selectedVisit.workAddress,
        contacts: JSON.parse(selectedVisit.contacts),
        visitReason: selectedVisit.visitReason,
      });
      setIsDialogOpenEdit(true);
    }
    setAnchorEl(null);
  };

  const handleContactChange = (index, field, value) => {
    const updatedContacts = [...editVisitData.contacts];
    updatedContacts[index][field] = value;
    setEditVisitData({ ...editVisitData, contacts: updatedContacts });
  };

  const handleSaveEdit = async () => {
    try {
      const updatedVisit = {
        ...editVisitData,
        contacts: JSON.stringify(editVisitData.contacts),
      };

      const response = await visitService.updateVisit(selectedVisitId, updatedVisit);

      if (response.status === 200) {
        Swal.fire('Éxito', 'La visita se actualizó correctamente.', 'success');
        setIsDialogOpenEdit(false);
        getVisits(); // Refrescar la lista de visitas
      } else {
        Swal.fire('Error', 'No se pudo actualizar la visita.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un error al actualizar la visita.', 'error');
      console.error('Error al actualizar la visita:', error);
    }
  };
  const getCommentById = async () => {
    setComment('');
    try {
      const response = await visitService.getCommentById(selectedVisitId);
      if (response.status === 200) {
        setComment(response.data);
      }
      setIsDialogOpenComment(true);
    } catch (err) {
      console.error('Error fetching data:', err);
      Swal.fire('Error', 'No se pudo obtener el comentario.', 'error');
    }
  };
  const parseContactsString = (contactsString) => {
    try {
      const contactsArray = JSON.parse(contactsString);
      return parseContacts(contactsArray);
    } catch (error) {
      console.error("Error al parsear los contactos:", error);
      return "No hay contactos válidos";
    }
  };
  const handleGenerateEmail = (visitId) => {
    const selectedVisit = visits.find(visit => visit.id === visitId);
    if (selectedVisit) {
      const contacts = JSON.parse(selectedVisit.contacts);
      const contactNames = contacts.map(contact => contact.FullName).join(' / ');
      const contactPhones = contacts.map(contact => contact.Phone).join(' / ');
      const contactEmails = contacts.map(contact => contact.Email).join(' / ');

      const emailContent = `Estimados Manuel / Felipe\n\n` +
        `Por favor de programar una visita técnica de Bloques para el cliente ${selectedVisit.client}, favor de coordinar con el cliente.\n\n` +
        `CLIENTE: ${selectedVisit.client}\n` +
        `OBRA: ${selectedVisit.work}\n` +
        `Dirección: ${selectedVisit.workAddress}\n` +
        `Contactos: ${contactNames} - ${contactPhones}\n` +
        `Correo: ${contactEmails}\n\n` +
        `Muchas gracias por el apoyo\n\n` +
        `Saludos cordiales`;

      setEmailContent(emailContent);
      setIsDialogOpenEmail(true);
    }
    setAnchorEl(null);
  };
  const parseContacts = (contacts) => {
    if (!contacts || !Array.isArray(contacts)) return "No hay contactos";

    return contacts.map((contact, index) => (
      <div key={index}>
        <ul>
          <li><strong>Nombre:</strong> {contact.FullName}</li>
          <li><strong>Posición:</strong> {contact.Position}</li>
          <li><strong>Email:</strong> {contact.Email}</li>
          <li><strong>Teléfono:</strong> {contact.Phone}</li>
        </ul>
        {/* Agrega un Divider si no es el último contacto */}
        {index < contacts.length - 1 && <Divider sx={{ my: 2, borderColor: 'black' }} />}
      </div>
    ));
  };

  // Renderizar visitas
  const renderVisits = (visits) => {
    return visits.map((visit) => (
      <TableRow hover key={visit.id}>
        <TableCell>{visit.visitCode}</TableCell>
        <TableCell>{visit.client}</TableCell>
        <TableCell>{visit.work}</TableCell>
        <TableCell>{visit.workAddress}</TableCell>
        <TableCell>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center', // Alinea verticalmente los elementos
            }}
          >
            <SeverityPill color={statusMap[visit.statusOrder]}>
              {visit.statusName}
            </SeverityPill>
            <div>
              <IconButton
                aria-label="more"
                aria-controls="long-menu"
                aria-haspopup="true"
                onClick={(event) => handleMenuClick(event, visit)}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                id="long-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <div hidden={selectedStatusNumber !== 1}>
                  <MenuItem style={{ marginRight: '8px', color: 'green' }} onClick={() => handleConfirmAction(selectedVisitId)}>
                    <CheckCircle style={{ marginRight: '8px' }} /> Atentido
                  </MenuItem>
                  <MenuItem onClick={() => handleEditVisit(selectedVisitId)} style={{ display: 'flex', alignItems: 'center' }}>
                    <EditIcon style={{ marginRight: '8px' }} /> Editar
                  </MenuItem>
                </div>

                <MenuItem onClick={() => handleAddComment(selectedVisitId)} style={{ display: 'flex', alignItems: 'center' }}>
                  <CommentIcon style={{ marginRight: '8px' }} /> Comentario
                </MenuItem>

                <MenuItem onClick={() => handleGenerateEmail(selectedVisitId)} style={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon style={{ marginRight: '8px' }} /> Generar Correo
                </MenuItem>
                <div hidden={selectedStatusNumber !== 1}>
                  <MenuItem onClick={() => handleRemoveVisit(selectedVisitId)} style={{ display: 'flex', alignItems: 'center' }}>
                    <CloseIcon style={{ marginRight: '8px' }} /> Eliminar
                  </MenuItem>
                </div>

              </Menu>
            </div>
          </Box>
        </TableCell>
        <TableCell>
          {new Date(visit.createdOn).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </TableCell>
        <TableCell>{parseContactsString(visit.contacts)}</TableCell>

        <TableCell>{visit.visitReason}</TableCell>

        <TableCell>{visit.createdBy}</TableCell>

      </TableRow>
    ));
  };

  // Confirmar acción con SweetAlert2
  const handleConfirmAction = (visitId) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas confirmar esta acción?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        visitService.updateVisitStatus(visitId, 2) // 2 representa "Atendido"
          .then(() => {
            Swal.fire('Confirmado', 'La acción ha sido confirmada.', 'success');
            getVisits(); // Refrescar la lista de visitas
          })
          .catch((error) => {
            Swal.fire('Error', 'No se pudo confirmar la acción.', 'error');
            console.error('Error al confirmar la acción:', error);
          });
      }
    });
    setAnchorEl(null);
  };

  // Diálogo para agregar comentario
  const handleAddComment = (visitId) => {
    handleMenuClose();
    setSelectedVisitId(visitId); // Guardar el ID de la visita seleccionada
    getCommentById(); // Obtener el comentario actual
  };

  return (
    <>
      <Head>
        <title>Visitas</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Typography variant="h4">
                    Total de visitas [{new Intl.NumberFormat('en-US').format(totalVisits)}]
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="contained" onClick={clearFilters}>
                    Limpiar Filtros
                  </Button>
                  <Button
                    onClick={handleOpenLinkDialog}
                    startIcon={
                      <SvgIcon fontSize="small">
                        <PlusIcon />
                      </SvgIcon>
                    }
                    variant="outlined"
                  >
                    Link de visita
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            <Card>
              <Scrollbar>
                <Box sx={{ minWidth: 800 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <TextField
                            sx={{ width: '160px', marginRight: '-20px' }}
                            label="Código"
                            type='number'
                            value={filterCode}
                            onChange={(e) => setFilterCode(e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            sx={{ width: '225px', marginRight: '-20px' }}
                            label="Cliente"
                            value={filterClient}
                            onChange={(e) => setFilterClient(e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            sx={{ width: '225px', marginRight: '-20px' }}
                            label="Obra"
                            value={filterWork}
                            onChange={(e) => setFilterWork(e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            sx={{ width: '225px', marginRight: '-20px' }}
                            label="Dirección"
                            value={filterWorkAddress}
                            onChange={(e) => setFilterWorkAddress(e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            sx={{ width: '225px', marginRight: '-20px' }}
                            label="Estado"
                            value={filterStatusName}
                            onChange={(e) => setFilterStatusName(e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', alignItems: 'center', width: '150px', marginRight: '-20px' }}>
                            <span>Fecha de solicitud</span>
                          </div><br />
                          <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
                            <DatePicker
                              value={selectedCreatedOn}
                              onChange={(newValue) => setSelectedCreatedOn(newValue)}
                              inputFormat="dd/MM/yyyy"
                              renderInput={(params) => <TextField {...params} variant="standard" helperText="" />}
                            />
                          </LocalizationProvider>
                        </TableCell>
                        <TableCell>
                          <TextField
                            sx={{ width: '225px', marginRight: '-20px' }}
                            label="Contactos"
                            value={filterContacts}
                            onChange={(e) => setFilterContacts(e.target.value)}
                          />
                        </TableCell>

                        <TableCell>
                          <TextField
                            sx={{ width: '225px', marginRight: '-20px' }}
                            label="Razón de visita"
                            value={filterVisitReason}
                            onChange={(e) => setFilterVisitReason(e.target.value)}
                          />
                        </TableCell>

                        <TableCell>
                          <Autocomplete
                            key={resetFilter}
                            value={employeeOptions.find((option) => option.id === filterCreatedBy)}
                            onChange={(event, newValue) => {
                              setFilterCreatedBy(newValue ? newValue.id : null);
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
                      </TableRow>
                    </TableHead>
                    <TableBody>{renderVisits(visits)}</TableBody>
                  </Table>
                </Box>
                <Dialog open={isDialogOpenComment} onClose={() => setIsDialogOpenComment(false)} fullWidth maxWidth="sm">
                  <DialogTitle>Agregar Comentario</DialogTitle>
                  <DialogContent>
                    <TextField
                      fullWidth
                      multiline
                      minRows={4} // Número mínimo de filas visibles
                      maxRows={8} // Número máximo de filas visibles antes de mostrar un scroll
                      variant="outlined"
                      placeholder="Escribe tu comentario aquí..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      sx={{ marginTop: 2 }}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setIsDialogOpenComment(false)} color="primary">
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        visitService.updateCommentById(selectedVisitId, comment)
                          .then(() => {
                            Swal.fire('Comentario actualizado', 'El comentario ha sido guardado.', 'success');
                            setIsDialogOpenComment(false);
                            getVisits(); // Refrescar la lista de visitas
                          })
                          .catch((error) => {
                            Swal.fire('Error', 'No se pudo guardar el comentario.', 'error');
                            console.error('Error al guardar el comentario:', error);
                          });
                      }}
                      color="primary"
                    >
                      Guardar
                    </Button>
                  </DialogActions>
                </Dialog>
                <Dialog open={isDialogOpenEmail} onClose={() => setIsDialogOpenEmail(false)} fullWidth maxWidth="sm">
                  <DialogTitle style={{ textAlign: 'center' }}>Generar Correo</DialogTitle>
                  <DialogContent>
                    <TextField
                      fullWidth
                      multiline
                      minRows={10}
                      maxRows={15}
                      variant="outlined"
                      value={emailContent}
                      InputProps={{ readOnly: true }}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(emailContent);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      startIcon={<ContentCopyIcon />}
                      color={copied ? 'success' : 'primary'}
                    >
                      {copied ? 'Copiado' : 'Copiar'}
                    </Button>
                    <Button onClick={() => setIsDialogOpenEmail(false)} color="error">
                      Cerrar
                    </Button>
                  </DialogActions>
                </Dialog>
                <Dialog open={isDialogOpenEdit} onClose={() => setIsDialogOpenEdit(false)} fullWidth maxWidth="md">
                  <DialogTitle>Editar Visita Técnica</DialogTitle>
                  <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Cliente"
                          value={editVisitData.client}
                          onChange={(e) => setEditVisitData({ ...editVisitData, client: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Obra"
                          value={editVisitData.work}
                          onChange={(e) => setEditVisitData({ ...editVisitData, work: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Dirección de Obra"
                          value={editVisitData.workAddress}
                          onChange={(e) => setEditVisitData({ ...editVisitData, workAddress: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="h6">Contactos</Typography>
                        {editVisitData.contacts.map((contact, index) => (
                          <Grid container spacing={2} key={index} sx={{ mt: 1 }}>
                            <Grid item xs={3}>
                              <TextField
                                fullWidth
                                label="Nombre Completo"
                                value={contact.FullName}
                                onChange={(e) => handleContactChange(index, 'FullName', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={3}>
                              <TextField
                                fullWidth
                                label="Cargo"
                                value={contact.Position}
                                onChange={(e) => handleContactChange(index, 'Position', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={3}>
                              <TextField
                                fullWidth
                                label="Correo"
                                value={contact.Email}
                                onChange={(e) => handleContactChange(index, 'Email', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={3}>
                              <TextField
                                fullWidth
                                label="Celular"
                                value={contact.Phone}
                                onChange={(e) => handleContactChange(index, 'Phone', e.target.value)}
                              />
                            </Grid>
                          </Grid>
                        ))}
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Motivo de Visita"
                          value={editVisitData.visitReason}
                          onChange={(e) => setEditVisitData({ ...editVisitData, visitReason: e.target.value })}
                        />
                      </Grid>
                    </Grid>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setIsDialogOpenEdit(false)} color="error">
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveEdit} color="primary">
                      Guardar
                    </Button>
                  </DialogActions>
                </Dialog>
                {/* Diálogo del enlace de solicitud */}
                <Dialog open={openLinkDialog} onClose={handleCloseLinkDialog} fullWidth maxWidth="sm">
                  <DialogTitle style={{ textAlign: 'center' }}>Link de visita</DialogTitle>
                  <DialogContent>
                    <p>Estimado cliente, le comparto el siguiente link para que realice su visita:</p>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={requestLink}
                      InputProps={{ readOnly: true }}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={handleCopyLink}
                      startIcon={<ContentCopyIcon />}
                      color={copied ? 'success' : 'primary'}
                    >
                      {copied ? 'Copiado' : 'Copiar'}
                    </Button>
                    <Button onClick={handleCloseLinkDialog} color="error">
                      Cerrar
                    </Button>
                  </DialogActions>
                </Dialog>
              </Scrollbar>
              <TablePagination
                component="div"
                count={totalVisits}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Elementos por página"
              />
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;