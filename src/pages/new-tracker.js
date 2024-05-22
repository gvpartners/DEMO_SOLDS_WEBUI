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
    List,
    ListItem,
    ListItemText,
    Checkbox,
    Button,
    IconButton,
    InputAdornment,
    Chip,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TablePagination
} from '@mui/material';
import Swal from 'sweetalert2';
import SearchIcon from '@mui/icons-material/Search';
import { es } from 'date-fns/locale'
import DeleteIcon from '@mui/icons-material/Delete';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import uniconJson from 'src/config/unicon.json';
import fletesJson from 'src/config/fletes.json';
import TrackService from 'src/services/trackService';
import InvoiceService from 'src/services/invoiceService';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { useRouter } from 'next/router';
import customerService from 'src/services/customerService';
import Visibility from '@mui/icons-material/Visibility';
import { padding } from '@mui/system';
const Page = () => {
    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '20px',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.15)'
    };

    const thTdStyle = {
        padding: '10px',
        textAlign: 'left',
        borderBottom: '1px solid #ddd'
    };

    const hoverStyle = {
        backgroundColor: '#f9f9f9'
    };
    const router = useRouter();
    const { TrackId } = router.query;
    const [parsedTrack, setParsedTrack] = useState(null);
    const [customers, setCustomers] = useState(null);
    const [total, setTotal] = useState(0);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterName, setFilterName] = useState('');
    const [filterIdentificationInfo, setFilterIdentificationInfo] = useState('');

    const getCustomers = async () => {
        try {
            var customerPag = {
                pageNumber: page,
                pageSize: rowsPerPage,
                filters: {
                    customerNameFilter: filterName,
                    identificationInfoFilter: filterIdentificationInfo,
                    identificationTypeFilter: identificationType
                }
            };
            const response = await customerService.getCustomers(customerPag);
            if (response.status == 200) {
                const fetchedData = await response.data;
                setCustomers(fetchedData.customers);
                setTotal(fetchedData.total);
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

    useEffect(() => {
        getCustomers();
    }, [page, rowsPerPage, filterName, filterIdentificationInfo]);

    useEffect(() => {
        const fetchData = async () => {
            if (TrackId) {
                try {
                    const response = await TrackService.getTrackById(TrackId);
                    if (response.status == 200) {
                        const fetchedData = await response.data;
                        setParsedTrack(fetchedData);
                    }
                } catch (error) {
                    console.error('Error fetching Track:', error);
                }
            }
        };

        getCustomers();
        fetchData();
    }, [TrackId]);


    useEffect(() => {

        const uniqueCategories = Array.from(new Set(uniconJson.map(item => item.Category)));
        setCategories(uniqueCategories);

        if (parsedTrack) {
            AutopopulatedFunction(parsedTrack);
        }
    }, [parsedTrack]);


    const [identificationType, setIdentificationType] = useState('');
    const [identificationInfo, setIdentificationInfo] = useState('');
    const [documentInfo, setDocumentInfo] = useState('');
    const [telephone, setTelephone] = useState('');
    const [percentageOfDiscount, setPercentageOfDiscount] = useState('0');
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    const [address, setAddress] = useState('');
    const [reference, setReference] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedMeasures, setSelectedMeasures] = useState([]);
    const [measuresOptions, setMeasuresOptions] = useState([]);
    const [selectedTruck, setSelectedTruck] = useState('');

    const [selectedClient, setSelectedClient] = useState('');

    const [deliveryType, setDeliveryType] = useState('');
    const [isParihuelaNeeded, setIsParihuelaNeeded] = useState('No');
    const [isOtherDistrict, setIsOtherDistrict] = useState('No');
    const [discountApplies, setDiscountApplies] = useState('No');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [measureQuantities, setMeasureQuantities] = useState(Array(selectedMeasures.length).fill(1));
    const [truck9TN, setTruck9TN] = useState(0);
    const [truck20TN, setTruck20TN] = useState(0);
    const [truck32TN, setTruck32TN] = useState(0);
    const [isCustomerInDataBase, setIsCustomerInDataBase] = useState(false);
    const handleIdentificationTypeChange = (event) => {
        setIdentificationType(event.target.value);
        setIdentificationInfo('');
        setDocumentInfo('');
    };
    const [orderDate, setorderDate] = useState(null);
    const [deliveryDate, setdeliveryDate] = useState(null);
    const handleorderDateChange = (date) => {
        setorderDate(date);
    };
    const handledeliveryDateChange = (date) => {
        setdeliveryDate(date);
    };
    const handleIdentificationInfoChange = (event) => {
        setIdentificationInfo(event.target.value);
    };

    const getIsCustomerInDb = async (customerNumber) => {
        try {

            const response = await customerService.getIsCustomerInDb(customerNumber);
            if (response.status == 200) {
                const fetchedData = await response.data;
                setIsCustomerInDataBase(fetchedData);
            }
            else {
                setIsCustomerInDataBase(false);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    }

    const handleDocumentInfoChange = (event) => {
        setDocumentInfo(event.target.value);
        if (event.target.value.length > 7) {
            getIsCustomerInDb(event.target.value);
        }
        else {
            setIsCustomerInDataBase(false);
        }
    };

    const handleTelephoneChange = (event) => {
        setTelephone(event.target.value);
    };
    const handlePercentageOfDiscountChange = (event) => {
        setPercentageOfDiscount(event.target.value);
    };
    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };
    const handleContactChange = (event) => {
        setContact(event.target.value);
    };
    const handleAddressChange = (event) => {
        setAddress(event.target.value);
        if (event.target.value == 'Jr Placido Jiménez 790 Cercado de Lima') {
            setSelectedDistrict('EL AGUSTINO')
        }
        else if (event.target.value == 'Av. Camino Principal Lote 80 Urb. Parcela Cajamarquilla') {
            setSelectedDistrict('LURIGANCHO (AV.CAJAMARQUILLA)')
        }
    };
    const handleReferenceChange = (event) => {
        setReference(event.target.value);
    };
    const handleCategoryChange = (event) => {
        const selectedCategory = event.target.value;
        setSelectedCategory(selectedCategory);

        const measuresForCategory = uniconJson
            .filter(item => item.Category === selectedCategory)
            .map(item => item.Description);

        setMeasuresOptions(measuresForCategory);
    };

    const handleMeasuresChange = (event) => {
        setSelectedMeasures(event.target.value);
    };
    const handleTruckChange = (event) => {
        setSelectedTruck(event.target.value);
    };
    const handleClientChange = (event) => {
        setSelectedClient(event.target.value);
    };
    const handleDeliveryTypeChange = (event) => {
        setDeliveryType(event.target.value);
    };
    const handleParihuelaChange = (event) => {
        setIsParihuelaNeeded(event.target.value);
    };
    const handleOtherDistrictChange = (event) => {
        setIsOtherDistrict(event.target.value);
        if (event.target.value == "No") {
            setManualtotalPriceFlete(0);
            setSelectedDistrict('');
        }
        else {
            setSelectedDistrict('');
            setTruck9TN(0);
            setTruck20TN(0);
            setTruck32TN(0);
        }
    };
    const handleDiscountChange = (event) => {
        if (event.target.value == 'No') {
            setPercentageOfDiscount(0);
        }
        setDiscountApplies(event.target.value);
    };

    const isSaveDisabled = () => {
        const validateLengthQuantities = selectedMeasures.length === measureQuantities.length;
        const isQuantityValid = measureQuantities.every(quantity => quantity >= 0);



        return (
            // !identificationType ||
            // !documentInfo ||
            // !identificationInfo ||
            !selectedClient ||
            !selectedCategory ||
            selectedMeasures.length === 0 ||
            selectedTruck.length === 0 ||
            !deliveryType ||
            !deliveryDate ||
            !isQuantityValid ||
            !validateLengthQuantities
        );
    };


    const handleDeleteMeasure = (index) => {
        const updatedMeasures = [...selectedMeasures];
        updatedMeasures.splice(index, 1);
        const updatedQuantities = [...measureQuantities];
        updatedQuantities.splice(index, 1);
        setSelectedMeasures(updatedMeasures);
        setMeasureQuantities(updatedQuantities);
    };

    const handleDistrictChange = (event) => {
        setSelectedDistrict(event.target.value);
        if (event.target.value == '' || event.target.value == null) {
            setIsOtherDistrict("No")
            setTruck9TN(0);
            setTruck20TN(0);
            setTruck32TN(0);
        }
    };

    const handleQuantityChange = (event, index) => {
        const newQuantities = [...measureQuantities];
        newQuantities[index] = event.target.valueAsNumber;
        setMeasureQuantities(newQuantities);
    };

    const [isLoading, setIsLoading] = useState(false);

    const getSunatValue = async () => {
        setIsLoading(true);
        try {
            const response = await InvoiceService.getSunatValue(identificationType.toLowerCase(), documentInfo);
            if (response.data != "error") {
                setIdentificationInfo(response.data);
            }
            else {
                Swal.fire({
                    title: 'No se encontró resultados en la búsqueda.',
                    text: 'Ingresa manualmente',
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
            }

        } catch (error) {
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
    const updateTrack = async (viewData) => {
        try {
            // Mostrar el diálogo de confirmación
            const confirmAction = await Swal.fire({
                title: 'Confirmar actualización',
                text: '¿Está seguro de actualizar este pedido?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, actualizar',
                cancelButtonText: 'Cancelar',
            });

            // Verificar si el usuario confirmó la actualización
            if (confirmAction.isConfirmed) {
                const response = await TrackService.updateTrack(TrackId, viewData);
                if (response.status == 200) {
                    router.push('/tracker');
                    Swal.fire({
                        title: 'Actualización de pedido',
                        text: 'Se actualizó satisfactoriamente la pedido',
                        icon: 'success',
                        confirmButtonText: 'OK',
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: 'Hubo un error al actualizar la pedido',
                        icon: 'error',
                        confirmButtonText: 'OK',
                    });
                }
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Hubo un error al actualizar la pedido',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    const createTrack = async (data) => {
        try {
            // Mostrar el diálogo de confirmación
            const confirmAction = await Swal.fire({
                title: 'Confirmar creación',
                text: '¿Está seguro de crear este pedido?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, crear',
                cancelButtonText: 'Cancelar',
            });

            // Verificar si el usuario confirmó la creación
            if (confirmAction.isConfirmed) {
                const response = await TrackService.createTrack(data);

                if (response.status == 200) {
                    router.push('/tracker');
                    Swal.fire({
                        title: 'Creación de pedido',
                        text: 'Se creó satisfactoriamente la pedido',
                        icon: 'success',
                        confirmButtonText: 'OK',
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: 'Hubo un error al crear la pedido',
                        icon: 'error',
                        confirmButtonText: 'OK',
                    });
                }
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Hubo un error al crear la pedido',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    const getTotalWeight = () => {
        let totalWeight = 0;

        for (const [index, measure] of selectedMeasures.entries()) {
            const measureInfo = uniconJson.find(item => item.Description === measure);
            if (measureInfo) {
                const quantity = measureQuantities[index] || 0;
                totalWeight += measureInfo.Weight * quantity;
            }
        }

        return totalWeight;
    };
    const getPiecesTotal = () => {
        let totalofPieces = 0;

        for (const [index, measure] of selectedMeasures.entries()) {
            const measureInfo = uniconJson.find(item => item.Description === measure);
            if (measureInfo) {
                const quantity = measureQuantities[index] || 0;
                totalofPieces += quantity;
            }
        }

        return totalofPieces;
    }


    const handleCot = (action) => {
        if (isSaveDisabled()) {
            Swal.fire({
                title: 'Campos mandatorios',
                text: 'Complete todos los campos requeridos',
                icon: 'info',
                confirmButtonText: 'OK'
            });
            return;
        }

        const unitPiece = uniconJson.find(item => item.Category === selectedCategory)?.Unit;

        const viewData = {
            identificationType,
            documentInfo,
            identificationInfo,
            contact,
            telephone,
            selectedClient,
            orderDate:deliveryDate,
            deliveryDate,
            selectedTruck,
            selectedCategory,
            selectedMeasures,
            measureQuantities,
            deliveryType,
            totalWeight: getTotalWeight() || 0,
            totalOfPieces: getPiecesTotal() || 0,
            unitPiece: unitPiece,
            createdBy: sessionStorage.getItem('userEmail'),
            userId: sessionStorage.getItem('identificator'),
        };

        if (action === "update") {
            updateTrack(viewData);
        } else if (action === "create") {
            createTrack(viewData);
        }
    };


    const AutopopulatedFunction = (viewData) => {

        setIdentificationType(viewData.identificationType);
        setDocumentInfo(viewData.documentInfo);
        setIdentificationInfo(viewData.identificationInfo);
        setTelephone(viewData.telephone);
        setSelectedClient(viewData.selectedClient);
        setDeliveryType(viewData.deliveryType);
        setSelectedTruck(viewData.selectedTruck);
        setSelectedCategory(viewData.selectedCategory);
        setorderDate(viewData.orderDate);
        setdeliveryDate(viewData.deliveryDate);
        const measuresForCategory = uniconJson
            .filter(item => item.Category === viewData.selectedCategory)
            .map(item => item.Description);
        setMeasuresOptions(measuresForCategory);
        setSelectedMeasures(viewData.selectedMeasures);
        setMeasureQuantities(viewData.measureQuantities);


        setAddress(viewData.address);
        setReference(viewData.reference);
        setContact(viewData.contact);

        setIsAutopopulated(true);


    };


    const [isAutopopulated, setIsAutopopulated] = useState(false);


    useEffect(() => {

    }, [isAutopopulated, selectedMeasures, measureQuantities]);


    const [selectedOption, setSelectedOption] = useState('');
    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const [isEditModalOpen, setEditModalOpen] = useState(false);

    useEffect(() => {
        getCustomers()
    }, [identificationType]);


    const handleCloseEditModal = () => {
        setEditModalOpen(false);
    };

    const [selectedCustomer, setSelectedCustomer] = useState(null);


    const handleRowClick = (customer) => {
        setIdentificationInfo(customer?.customerName || "");
        setDocumentInfo(customer?.identificationInfo || "");
        setSelectedCustomer(customer);
        setEditModalOpen(false);
    };
    return (
        <Container>
            <Box display={{ xs: 'block', md: 'flex' }}>

                <Box flex={1} marginRight={5} marginLeft={{ md: -10 }}>
                    <Typography variant="h4" style={{ fontSize: '28px' }}>{!TrackId ? "Nuevo Pedido" : parsedTrack?.trackCode}</Typography><br />
                    <label>Tipo de identificación</label>
                    <FormControl fullWidth>
                        <Select value={identificationType} onChange={handleIdentificationTypeChange}>
                            <MenuItem value="DNI">DNI</MenuItem>
                            <MenuItem value="RUC">RUC</MenuItem>
                        </Select>
                    </FormControl>
                    <br /><br />

                    <FormControl fullWidth>
                        <TextField
                            label={identificationType === 'DNI' ? <span>DNI </span> : <span>RUC </span>}
                            value={documentInfo}
                            onChange={handleDocumentInfoChange}
                            type='number'
                            disabled={!identificationType}
                            fullWidth
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end" >
                                        <IconButton edge="start" onClick={() => { setEditModalOpen(true) }} disabled={!identificationType}>
                                            <Visibility style={{ color: isCustomerInDataBase ? 'green' : '' }} />
                                        </IconButton>
                                        <IconButton edge="end" onClick={getSunatValue} disabled={!identificationType}>
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
                    </FormControl>


                    <br /><br />

                    <FormControl fullWidth>
                        <TextField
                            label={identificationType === 'DNI' ? <span>Nombre completo </span> : <span>Razón social </span>}
                            value={identificationInfo}
                            onChange={handleIdentificationInfoChange}
                            fullWidth
                        // inputProps={{ readOnly: true }}
                        />
                    </FormControl>
                    <br /><br />
                    <FormControl fullWidth>
                        <TextField
                            label="Contacto"
                            type="text"
                            value={contact}
                            onChange={handleContactChange}
                            fullWidth
                        />
                    </FormControl>
                    <br></br>
                    <br></br>
                    <FormControl fullWidth>
                        <TextField
                            label="Teléfono Celular"
                            type='number'
                            value={telephone}
                            onChange={handleTelephoneChange}
                            fullWidth
                        />

                    </FormControl>

                    <FormControl fullWidth>
                        <br></br>
                        <label>
                            Tipo de cliente
                            <font color="red"> *</font>
                        </label>
                        <Select value={selectedClient} onChange={handleClientChange}>
                            <MenuItem value="CLIENTE DIRECTO">CLIENTE DIRECTO</MenuItem>
                            <MenuItem value="CLIENTE RETAIL">CLIENTE RETAIL</MenuItem>
                            <MenuItem value="DISTRIBUIDOR">DISTRIBUIDOR</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <br></br>
                        <label>
                            Tipo de entrega
                            <font color="red"> *</font>
                        </label>
                        <Select value={deliveryType} onChange={handleDeliveryTypeChange}>
                            <MenuItem value="ENTREGADO EN PLANTA">ENTREGADO EN PLANTA</MenuItem>
                            <MenuItem value="PUESTO EN OBRA">PUESTO EN OBRA</MenuItem>
                        </Select>
                    </FormControl>
                    <br /><br />

                    <FormControl fullWidth>
                        <label>Categoria<font color="red"> *</font></label>

                        <Select value={selectedCategory} onChange={handleCategoryChange}>
                            {categories.map((category, index) => (
                                <MenuItem key={index} value={category}>{category}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                </Box>
                <Box flex={1.4} marginRight={5} marginTop={{ xs: 1.8, md: 0 }}>
                    <FormControl fullWidth>
                        <label>
                            Productos
                            <font color="red"> *</font>
                        </label>

                        <Autocomplete
                            multiple
                            options={measuresOptions}
                            value={selectedMeasures}
                            disabled={!selectedCategory}
                            onChange={(event, newValue) => handleMeasuresChange({ target: { value: newValue } })}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="standard"
                                />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        variant="outlined"
                                        label={option}
                                        {...getTagProps({ index })}
                                    />
                                ))
                            }
                        />

                    </FormControl>
                    <br></br>
                    <FormControl fullWidth style={{ marginTop: 35 }}>
                        <label>
                            Tipo de camión
                            <font color="red"> *</font>
                        </label>
                        <Select value={selectedTruck} onChange={handleTruckChange}>
                            <MenuItem value="9 TN">9 TN</MenuItem>
                            <MenuItem value="20 TN">20 TN</MenuItem>
                            <MenuItem value="32 TN">32 TN</MenuItem>
                        </Select>
                    </FormControl>
                    <div style={{

                        marginBottom: '20px',
                        marginTop: '30px',
                    }}>

                        <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
                            <label>
                                Fecha de entrega
                                <font color="red"> *</font>
                            </label>
                            <div style={{ marginTop: '20px' }}>

                                <DatePicker
                                    value={deliveryDate}
                                    onChange={handledeliveryDateChange}
                                    inputFormat="dd/MM/yyyy"
                                    renderInput={(params) => <TextField {...params} variant="standard" helperText="" />}
                                />
                            </div>
                        </LocalizationProvider>
                    </div>
                    <br></br>
                    {selectedMeasures.length > 0 && (
                        <Typography variant="h6" >
                            Bloques seleccionados
                        </Typography>
                    )}
                    <br></br>
                    {selectedMeasures.length > 0 && (
                        <table style={tableStyle} >
                            <thead>
                                <tr>
                                    <th style={thTdStyle}>Producto</th>
                                    <th style={thTdStyle}>Cantidad</th>
                                    <th style={thTdStyle}>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedMeasures.map((measure, index) => {


                                    return (
                                        <tr key={index} style={hoverStyle}>
                                            <td style={thTdStyle}>{measure}</td>
                                            <td style={thTdStyle}>
                                                <TextField
                                                    error={measureQuantities[index] === null || measureQuantities[index] === '' || isNaN(measureQuantities[index]) || measureQuantities[index] < 0}
                                                    type="number"
                                                    fullWidth
                                                    value={measureQuantities[index]}
                                                    onChange={(event) => handleQuantityChange(event, index)}
                                                />
                                            </td>

                                            <td style={thTdStyle}>
                                                <IconButton aria-label="Eliminar" onClick={() => handleDeleteMeasure(index)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}

                    {/* {selectedMeasures.length > 0 && (
                        <Typography variant="h7" style={{ float: 'left' }}>
                            CANT. PARIHUELAS: {cantParihuela || 0}
                        </Typography>
                    )} */}
                    {selectedMeasures.length > 0 && (
                        <Typography variant="h6" style={{ float: 'right' }}>
                            PESO TOTAL: {getTotalWeight() > 1000 ? `${(getTotalWeight() / 1000).toFixed(2)} TN` : `${getTotalWeight().toFixed(2)} KG`}
                        </Typography>
                    )}<br />

                    <br />


                    <Box style={{ float: 'right', marginTop: 30, marginBottom: 40 }}>
                        <Button variant="outlined" color="primary" style={{ marginRight: 8 }} onClick={() => { router.push('/tracker') }}>
                            Cerrar
                        </Button>

                        {!TrackId && (
                            <Button variant="contained" color="primary" onClick={() => handleCot("create")}>
                                Crear
                            </Button>
                        )}

                        {TrackId && (
                            <Button variant="contained" color="primary" onClick={() => handleCot("update")}>
                                Actualizar
                            </Button>
                        )}
                    </Box>

                </Box>
                <Dialog open={isEditModalOpen} onClose={handleCloseEditModal} maxWidth="md" fullWidth>
                    <DialogTitle style={{ textAlign: 'center' }}>
                        Lista de clientes [{total}]
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
                                <TableBody style={{ cursor: 'pointer' }}>
                                    {customers?.map((customer) => (
                                        <TableRow key={customer.id} onClick={() => handleRowClick(customer)}>
                                            <TableCell>{customer.identificationInfo}</TableCell>
                                            <TableCell>{customer.customerName}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <TablePagination
                                component="div"
                                count={total}
                                onPageChange={handlePageChange}
                                onRowsPerPageChange={handleRowsPerPageChange}
                                page={page}
                                rowsPerPage={rowsPerPage}
                                rowsPerPageOptions={[5, 10, 25]}
                                labelRowsPerPage={"Elementos por página"}
                            />
                        </TableContainer>
                        <br></br>
                        {selectedCustomer && (
                            <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                                <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '0' }}>
                                    CLIENTE SELECCIONADO: {selectedCustomer.customerName}
                                </p>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>


            </Box>
        </Container>

    );


};

Page.propTypes = {
    // ... (propTypes for Page component if needed)
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
