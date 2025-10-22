import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    IconButton,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination
} from '@mui/material';
import Swal from 'sweetalert2';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import uniconJson from 'src/config/unicon.json';
import responsiblesJson from 'src/config/responsibles.json';
import monitoringService from 'src/services/monitoringService';
import customerService from 'src/services/customerService';
import Autocomplete from '@mui/material/Autocomplete';
import { useRouter } from 'next/router';
import userService from 'src/services/userService';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import SearchIcon from '@mui/icons-material/Search';
import Visibility from '@mui/icons-material/Visibility';

// Helper function to get current date/time in Peru timezone
const getPeruTime = () => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", {timeZone: "America/Lima"}));
};

const Page = () => {
    const router = useRouter();
    const { MonitoringId } = router.query;
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sunatLoading, setSunatLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterName, setFilterName] = useState('');
    const [filterIdentificationInfo, setFilterIdentificationInfo] = useState('');

    // Form states
    const [formData, setFormData] = useState({
        identificationType: 'RUC',
        documentInfo: '',
        identificationInfo: '',
        telephone: '',
        email: '',
        contact: '',
        quantity: 0,
        quantityDisplay: '',
        selectedDistrict: 'N/A',
        selectedCategory: '',
        daysToComplete: 0,
        deliveryType: '',
        requirementDate: null,
        quotedDate: null,
        responsible: '',
        executive: '',
        segment: '',
        address: '',
        comment: ''
    });

    const [errors, setErrors] = useState({});

    // Options
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [districtOptions, setDistrictOptions] = useState([]);
    const [plantOptions, setPlantOptions] = useState([
        'Jr Placido Jiménez 790 Cercado de Lima',
        'Av. Camino Principal Lote 80 Urb. Parcela Cajamarquilla'
    ]);
    const [responsibleOptions, setResponsibleOptions] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);

    // Load user data from session storage
    useEffect(() => {
        const loadUser = () => {
            try {
                // Get user data from session storage
                const sessionUser = sessionStorage.getItem('user');
                const sessionUserId = sessionStorage.getItem('identificator');
                
                if (sessionUser && sessionUserId) {
                    const userData = {
                        id: sessionUserId,
                        name: sessionUser.split(' ')[0] || '',
                        firstLastName: sessionUser.split(' ').slice(1).join(' ') || '',
                        email: sessionStorage.getItem('userEmail') || ''
                    };
                    
                    setUser(userData);
                    setFormData(prev => ({
                        ...prev,
                        executive: sessionUser // Set executive from session storage
                    }));
                }
            } catch (error) {
                console.error('Error loading user from session storage:', error);
            }
        };
        loadUser();
    }, []);

    // Load categories from unicon.json
    useEffect(() => {
        const categories = uniconJson.map(item => item.Category).filter((value, index, self) => self.indexOf(value) === index);
        setCategoryOptions(categories);
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

    // Load employees for executive field
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

    // Load monitoring data when MonitoringId is present (edit mode)
    useEffect(() => {
        if (MonitoringId) {
            setIsEditing(true);
            loadMonitoringData();
        }
    }, [MonitoringId]);

    // Load customers when modal opens
    useEffect(() => {
        if (isEditModalOpen) {
            getCustomers();
        }
    }, [isEditModalOpen, page, rowsPerPage, filterName, filterIdentificationInfo]);

    const loadMonitoringData = async () => {
        try {
            setLoading(true);
            const response = await monitoringService.getMonitoringById(MonitoringId);
            if (response.status === 200) {
                const monitoring = response.data;
                setFormData({
                    identificationType: monitoring.identificationType || 'RUC',
                    documentInfo: monitoring.documentInfo || '',
                    identificationInfo: monitoring.identificationInfo || '',
                    telephone: monitoring.telephone || '',
                    email: monitoring.email || '',
                    contact: monitoring.contact || '',
                    quantity: monitoring.quantity || 0,
                    quantityDisplay: monitoring.quantity ? monitoring.quantity.toLocaleString('es-PE', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                    }) : '',
                    selectedDistrict: monitoring.selectedDistrict || '',
                    selectedCategory: monitoring.selectedCategory || '',
                    daysToComplete: monitoring.daysToComplete || 0,
                    deliveryType: monitoring.deliveryType || '',
                    requirementDate: monitoring.requirementDate ? new Date(monitoring.requirementDate) : null,
                    quotedDate: monitoring.quotedDate ? new Date(monitoring.quotedDate) : null,
                    responsible: monitoring.responsible || '',
                    executive: monitoring.executive || '',
                    segment: monitoring.segment || '',
                    address: monitoring.address || '',
                    comment: monitoring.comment || ''
                });
            }
        } catch (error) {
            console.error('Error loading monitoring:', error);
            Swal.fire('Error', 'Error al cargar los datos del seguimiento', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Auto-assign segment when responsible is selected
        if (field === 'responsible' && value) {
            const responsibleData = responsiblesJson.find(item => item.name === value);
            if (responsibleData) {
                setFormData(prev => ({
                    ...prev,
                    responsible: value,
                    segment: responsibleData.segment
                }));
            }
        }
        
        // Handle deliveryType change
        if (field === 'deliveryType') {
            if (value === 'ENTREGADO EN PLANTA') {
                // When switching to EN PLANTA, clear district to show plant options
                setFormData(prev => ({
                    ...prev,
                    deliveryType: value,
                    selectedDistrict: '' // Clear district to show plant options
                }));
            } else if (value === 'PUESTO EN OBRA') {
                // When switching to EN OBRA, keep district but clear if it was a plant
                setFormData(prev => ({
                    ...prev,
                    deliveryType: value,
                    selectedDistrict: prev.selectedDistrict === 'EL AGUSTINO' || prev.selectedDistrict === 'LURIGANCHO (AV.CAJAMARQUILLA)' ? '' : prev.selectedDistrict
                }));
            }
        }
        
        // Handle plant selection - plant IS the district
        if (field === 'selectedDistrict' && formData.deliveryType === 'ENTREGADO EN PLANTA') {
            let districtValue = '';
            if (value === 'Jr Placido Jiménez 790 Cercado de Lima') {
                districtValue = 'EL AGUSTINO';
            } else if (value === 'Av. Camino Principal Lote 80 Urb. Parcela Cajamarquilla') {
                districtValue = 'LURIGANCHO (AV.CAJAMARQUILLA)';
            }
            
            setFormData(prev => ({
                ...prev,
                selectedDistrict: districtValue // Plant becomes the district
            }));
        }
        
        // Auto-calculate quoted date when daysToComplete changes
        if (field === 'daysToComplete' && value && formData.requirementDate) {
            const requirementDate = new Date(formData.requirementDate);
            const quotedDate = new Date(requirementDate);
            quotedDate.setDate(quotedDate.getDate() + parseInt(value));
            
            setFormData(prev => ({
                ...prev,
                daysToComplete: value,
                quotedDate: quotedDate
            }));
        }
        
        // Auto-calculate quoted date when requirementDate changes (if daysToComplete is set)
        if (field === 'requirementDate' && value && formData.daysToComplete > 0) {
            const requirementDate = new Date(value);
            const quotedDate = new Date(requirementDate);
            quotedDate.setDate(quotedDate.getDate() + parseInt(formData.daysToComplete));
            
            setFormData(prev => ({
                ...prev,
                requirementDate: value,
                quotedDate: quotedDate
            }));
        }
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleSunatQuery = async () => {
        if (!formData.identificationInfo) {
            Swal.fire('Error', 'Por favor ingrese el RUC o DNI', 'error');
            return;
        }

        try {
            setSunatLoading(true);
            const response = await monitoringService.getSunatValue(
                formData.identificationType,
                formData.identificationInfo
            );
            
            if (response.status === 200) {
                const companyName = response.data;
                setFormData(prev => ({
                    ...prev,
                    documentInfo: companyName
                }));
                Swal.fire('Éxito', 'Datos obtenidos de SUNAT correctamente', 'success');
            }
        } catch (error) {
            console.error('Error querying SUNAT:', error);
            Swal.fire('Error', 'No se pudieron obtener los datos de SUNAT', 'error');
        } finally {
            setSunatLoading(false);
        }
    };

    const getCustomers = async () => {
        try {
            const customerPag = {
                pageNumber: page,
                pageSize: rowsPerPage,
                filters: {
                    customerNameFilter: filterName,
                    identificationInfoFilter: filterIdentificationInfo,
                    identificationTypeFilter: formData.identificationType
                }
            };
            const response = await customerService.getCustomers(customerPag);
            if (response.status == 200) {
                const fetchedData = await response.data;
                setCustomers(fetchedData.customers);
                setTotalCustomers(fetchedData.total);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
    };

    const handleRowClick = (customer) => {
        setFormData(prev => ({
            ...prev,
            documentInfo: customer?.customerName || "",
            identificationInfo: customer?.identificationInfo || ""
        }));
        setEditModalOpen(false);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.identificationInfo) {
            newErrors.identificationInfo = 'El RUC/DNI es requerido';
        }

        if (!formData.documentInfo) {
            newErrors.documentInfo = 'La razón social es requerida';
        }

        if (!formData.contact) {
            newErrors.contact = 'El contacto es requerido';
        }

        if (!formData.telephone) {
            newErrors.telephone = 'El teléfono es requerido';
        } else if (formData.telephone.length > 9) {
            newErrors.telephone = 'El teléfono no puede tener más de 9 dígitos';
        } else if (!/^\d{9}$/.test(formData.telephone)) {
            newErrors.telephone = 'El teléfono debe tener exactamente 9 dígitos';
        }

        if (!formData.selectedCategory) {
            newErrors.selectedCategory = 'La categoría es requerida';
        }

        if (!formData.selectedDistrict) {
            newErrors.selectedDistrict = formData.deliveryType === 'ENTREGADO EN PLANTA' 
                ? 'La planta es requerida' 
                : 'El distrito es requerido';
        }

        if (!formData.responsible) {
            newErrors.responsible = 'El responsable es requerido';
        }

        if (!formData.executive) {
            newErrors.executive = 'El ejecutivo es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            Swal.fire('Error', 'Por favor complete todos los campos requeridos', 'error');
            return;
        }

        try {
            setLoading(true);

            const monitoringData = {
                ...formData,
                userId: user.id
            };

            let response;
            if (isEditing) {
                response = await monitoringService.updateMonitoring(MonitoringId, monitoringData);
            } else {
                response = await monitoringService.createMonitoring(monitoringData);
            }

            if (response.status === 200) {
                Swal.fire(
                    'Éxito',
                    isEditing ? 'Seguimiento actualizado correctamente' : 'Seguimiento creado correctamente',
                    'success'
                ).then(() => {
                    router.push('/monitoring');
                });
            }
        } catch (error) {
            console.error('Error saving monitoring:', error);
            Swal.fire('Error', 'Error al guardar el seguimiento', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/monitoring');
    };

    if (loading && isEditing) {
        return (
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            component="main"
            sx={{
                flexGrow: 1,
                py: 8
            }}
        >
            <Container maxWidth="lg">
                <Typography variant="h4" gutterBottom>
                    {isEditing ? 'Editar Seguimiento' : 'Nuevo Seguimiento'}
                </Typography>

                <Card>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                {/* Información del Cliente */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>
                                        Información del Cliente
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth error={!!errors.identificationType}>
                                        <InputLabel>Tipo de Documento</InputLabel>
                                        <Select
                                            value={formData.identificationType}
                                            onChange={(e) => handleInputChange('identificationType', e.target.value)}
                                            label="Tipo de Documento"
                                        >
                                            <MenuItem value="RUC">RUC</MenuItem>
                                            <MenuItem value="DNI">DNI</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        fullWidth
                                        label="RUC/DNI"
                                        value={formData.identificationInfo}
                                        onChange={(e) => handleInputChange('identificationInfo', e.target.value)}
                                        error={!!errors.identificationInfo}
                                        helperText={errors.identificationInfo}
                                        required
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton 
                                                        edge="start" 
                                                        onClick={() => setEditModalOpen(true)} 
                                                        disabled={!formData.identificationType}
                                                    >
                                                        <Visibility />
                                                    </IconButton>
                                                    <IconButton 
                                                        edge="end" 
                                                        onClick={handleSunatQuery} 
                                                        disabled={!formData.identificationType}
                                                    >
                                                        {sunatLoading ? (
                                                            <CircularProgress size={20} />
                                                        ) : (
                                                            <SearchIcon />
                                                        )}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Razón Social"
                                        value={formData.documentInfo}
                                        onChange={(e) => handleInputChange('documentInfo', e.target.value)}
                                        error={!!errors.documentInfo}
                                        helperText={errors.documentInfo}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Contacto"
                                        value={formData.contact}
                                        onChange={(e) => handleInputChange('contact', e.target.value)}
                                        error={!!errors.contact}
                                        helperText={errors.contact}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Teléfono"
                                        value={formData.telephone}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                                            if (value.length <= 9) {
                                                handleInputChange('telephone', value);
                                            }
                                        }}
                                        error={!!errors.telephone}
                                        helperText={errors.telephone}
                                        required
                                        inputProps={{ maxLength: 9 }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Dirección"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                    />
                                </Grid>

                                {/* Información del Seguimiento */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                        Información del Seguimiento
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Cantidad (S/.)"
                                        value={formData.quantityDisplay || ''}
                                        onChange={(e) => {
                                            // Remove commas and non-numeric characters except decimal point
                                            let cleanValue = e.target.value.replace(/[^\d.]/g, '');
                                            
                                            // Handle multiple decimal points - keep only the first one
                                            const parts = cleanValue.split('.');
                                            if (parts.length > 2) {
                                                cleanValue = parts[0] + '.' + parts.slice(1).join('');
                                            }
                                            
                                            // Handle decimal places - limit to 2 decimal places
                                            const decimalParts = cleanValue.split('.');
                                            if (decimalParts[1] && decimalParts[1].length > 2) {
                                                cleanValue = decimalParts[0] + '.' + decimalParts[1].substring(0, 2);
                                            }
                                            
                                            // Update display value (raw input)
                                            setFormData(prev => ({
                                                ...prev,
                                                quantityDisplay: cleanValue
                                            }));
                                            
                                            // Convert to number for backend
                                            const numericValue = parseFloat(cleanValue) || 0;
                                            handleInputChange('quantity', numericValue);
                                        }}
                                        onBlur={() => {
                                            // Format with commas and 2 decimals when user finishes typing
                                            if (formData.quantity > 0) {
                                                const formatted = formData.quantity.toLocaleString('es-PE', { 
                                                    minimumFractionDigits: 2, 
                                                    maximumFractionDigits: 2 
                                                });
                                                setFormData(prev => ({
                                                    ...prev,
                                                    quantityDisplay: formatted
                                                }));
                                            }
                                        }}
                                        placeholder="0.00"
                                        helperText="Ingrese la cantidad en soles (máximo 2 decimales)"
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <Autocomplete
                                        options={categoryOptions}
                                        value={formData.selectedCategory}
                                        onChange={(event, newValue) => handleInputChange('selectedCategory', newValue || '')}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Categoría"
                                                error={!!errors.selectedCategory}
                                                helperText={errors.selectedCategory}
                                                required
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Días para completar</InputLabel>
                                        <Select
                                            value={formData.daysToComplete}
                                            onChange={(e) => handleInputChange('daysToComplete', e.target.value)}
                                            label="Días para completar"
                                        >
                                            <MenuItem value={1}>1 día (24 hrs)</MenuItem>
                                            <MenuItem value={2}>2 días (48 hrs)</MenuItem>
                                            <MenuItem value={3}>3 días (72 hrs)</MenuItem>
                                            <MenuItem value={4}>4 días (96 hrs)</MenuItem>
                                            <MenuItem value={5}>5 días (120 hrs)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Segmento"
                                        value={formData.segment}
                                        InputProps={{
                                            readOnly: true,
                                            disabled: true
                                        }}
                                        helperText="Se asigna automáticamente según el responsable"
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Tipo de Entrega</InputLabel>
                                        <Select
                                            value={formData.deliveryType}
                                            onChange={(e) => handleInputChange('deliveryType', e.target.value)}
                                            label="Tipo de Entrega"
                                        >
                                            <MenuItem value="ENTREGADO EN PLANTA">ENTREGADO EN PLANTA</MenuItem>
                                            <MenuItem value="PUESTO EN OBRA">PUESTO EN OBRA</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {formData.deliveryType === 'ENTREGADO EN PLANTA' && (
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Autocomplete
                                            options={plantOptions}
                                            value={formData.selectedDistrict}
                                            onChange={(event, newValue) => handleInputChange('selectedDistrict', newValue || '')}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Planta"
                                                    error={!!errors.selectedDistrict}
                                                    helperText={errors.selectedDistrict}
                                                    required
                                                />
                                            )}
                                        />
                                    </Grid>
                                )}

                                {formData.deliveryType === 'PUESTO EN OBRA' && (
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Autocomplete
                                            options={districtOptions}
                                            value={formData.selectedDistrict}
                                            onChange={(event, newValue) => handleInputChange('selectedDistrict', newValue || '')}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Distrito"
                                                    error={!!errors.selectedDistrict}
                                                    helperText={errors.selectedDistrict}
                                                    required
                                                />
                                            )}
                                        />
                                    </Grid>
                                )}

                                {/* Fechas */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                        Fechas
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                                        <DatePicker
                                            label="Fecha de Requerimiento"
                                            value={formData.requirementDate}
                                            onChange={(newValue) => handleInputChange('requirementDate', newValue)}
                                            renderInput={(params) => <TextField {...params} fullWidth />}
                                        />
                                    </LocalizationProvider>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                                        <DatePicker
                                            label="Fecha Cotizada"
                                            value={formData.quotedDate}
                                            onChange={(newValue) => handleInputChange('quotedDate', newValue)}
                                            renderInput={(params) => <TextField {...params} fullWidth />}
                                        />
                                    </LocalizationProvider>
                                </Grid>

                                {/* Responsables */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                        Responsables
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Autocomplete
                                        options={responsibleOptions}
                                        value={formData.responsible}
                                        onChange={(event, newValue) => handleInputChange('responsible', newValue || '')}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Responsable"
                                                error={!!errors.responsible}
                                                helperText={errors.responsible}
                                                required
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Autocomplete
                                        options={employeeOptions}
                                        value={formData.executive}
                                        onChange={(event, newValue) => handleInputChange('executive', newValue || '')}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Ejecutivo"
                                                error={!!errors.executive}
                                                helperText={errors.executive}
                                                required
                                            />
                                        )}
                                    />
                                </Grid>

                                {/* Comentarios */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                        Comentarios
                                    </Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        label="Comentario"
                                        value={formData.comment}
                                        onChange={(e) => handleInputChange('comment', e.target.value)}
                                    />
                                </Grid>

                                {/* Botones */}
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                                        <Button
                                            variant="outlined"
                                            onClick={handleCancel}
                                            disabled={loading}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={loading}
                                        >
                                            {loading ? <CircularProgress size={20} /> : (isEditing ? 'Actualizar' : 'Crear')}
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>
                    </CardContent>
                </Card>

                {/* Customer Modal */}
                <Dialog open={isEditModalOpen} onClose={handleCloseEditModal} maxWidth="md" fullWidth>
                    <DialogTitle style={{ textAlign: 'center' }}>
                        Lista de clientes [{totalCustomers}]
                    </DialogTitle>
                    <DialogContent>
                        <TableContainer component={Paper} style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <TextField
                                                sx={{ width: '240px' }}
                                                label="Número de Identificación"
                                                value={filterIdentificationInfo}
                                                onChange={(event) => setFilterIdentificationInfo(event.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                label="Nombre del Cliente"
                                                sx={{ width: '240px' }}
                                                value={filterName}
                                                onChange={(event) => setFilterName(event.target.value)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {customers.map((customer) => (
                                        <TableRow 
                                            key={customer.id} 
                                            hover 
                                            onClick={() => handleRowClick(customer)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <TableCell>{customer.identificationInfo}</TableCell>
                                            <TableCell>{customer.customerName}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            component="div"
                            count={totalCustomers}
                            onPageChange={handlePageChange}
                            onRowsPerPageChange={handleRowsPerPageChange}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            rowsPerPageOptions={[5, 10, 25]}
                        />
                    </DialogContent>
                </Dialog>
            </Container>
        </Box>
    );
};

Page.getLayout = (page) => (
    <DashboardLayout>
        {page}
    </DashboardLayout>
);

export default Page;
