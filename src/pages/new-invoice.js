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
import DeleteIcon from '@mui/icons-material/Delete';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import uniconJson from 'src/config/unicon.json';
import fletesJson from 'src/config/fletes.json';
import invoiceService from 'src/services/invoiceService';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
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
    const { InvoiceId } = router.query;
    const [parsedInvoice, setParsedInvoice] = useState(null);
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
            if (InvoiceId) {
                try {
                    const response = await invoiceService.getInvoiceById(InvoiceId);
                    if (response.status == 200) {
                        const fetchedData = await response.data;
                        setParsedInvoice(fetchedData);
                    }
                } catch (error) {
                    console.error('Error fetching invoice:', error);
                }
            }
        };

        getCustomers();
        fetchData();
    }, [InvoiceId]);


    useEffect(() => {

        const uniqueCategories = Array.from(new Set(uniconJson.map(item => item.Category)));
        setCategories(uniqueCategories);

        if (parsedInvoice) {
            AutopopulatedFunction(parsedInvoice);
        }
    }, [parsedInvoice]);


    const [identificationType, setIdentificationType] = useState('');
    const [identificationInfo, setIdentificationInfo] = useState('');
    const [documentInfo, setDocumentInfo] = useState('');
    const [telephone, setTelephone] = useState('');
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    const [address, setAddress] = useState('');
    const [reference, setReference] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedMeasures, setSelectedMeasures] = useState([]);
    const [measuresOptions, setMeasuresOptions] = useState([]);
    const [deliveryType, setDeliveryType] = useState('');
    const [isParihuelaNeeded, setIsParihuelaNeeded] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [measureQuantities, setMeasureQuantities] = useState(Array(selectedMeasures.length).fill(1));
    const [truck9TN, setTruck9TN] = useState(0);
    const [truck20TN, setTruck20TN] = useState(0);
    const [truck32TN, setTruck32TN] = useState(0);

    const handleIdentificationTypeChange = (event) => {
        setIdentificationType(event.target.value);
        setIdentificationInfo('');
        setDocumentInfo('');
    };

    const handleIdentificationInfoChange = (event) => {
        setIdentificationInfo(event.target.value);
    };

    const handleDocumentInfoChange = (event) => {
        setDocumentInfo(event.target.value);
    };

    const handleTelephoneChange = (event) => {
        setTelephone(event.target.value);
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

    const handleDeliveryTypeChange = (event) => {
        setDeliveryType(event.target.value);
        resetPuestoEnObra();
    };
    const handleParihuelaChange = (event) => {
        setIsParihuelaNeeded(event.target.value);
    };

    const isSaveDisabled = () => {
        const validateLengthQuantities = selectedMeasures.length === measureQuantities.length;
        const isQuantityValid = measureQuantities.every(quantity => quantity > 0);

        const isPuestoEnObra =
            deliveryType === "PUESTO EN OBRA" &&
            (!selectedDistrict ||
                !isParihuelaNeeded ||
                (truck9TN === null || truck9TN === '' || truck9TN < 0) ||
                (truck20TN === null || truck20TN === '' || truck20TN < 0) ||
                (truck32TN === null || truck32TN === '' || truck32TN < 0) ||
                (isParihuelaNeeded !== "No" &&
                    (cantParihuela === null || cantParihuela === '' || cantParihuela < 0) ||
                    (costParihuela === null || costParihuela === '' || costParihuela < 0)
                )
            );

        return (
            !identificationType ||
            !documentInfo ||
            !identificationInfo ||
            !selectedCategory ||
            selectedMeasures.length === 0 ||
            !address ||
            !isQuantityValid ||
            !validateLengthQuantities ||
            (isPuestoEnObra)
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
            const response = await invoiceService.getSunatValue(identificationType.toLowerCase(), documentInfo);
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
    const updateInvoice = async (viewData) => {
        try {
            // Mostrar el diálogo de confirmación
            const confirmAction = await Swal.fire({
                title: 'Confirmar actualización',
                text: '¿Está seguro de actualizar esta cotización?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, actualizar',
                cancelButtonText: 'Cancelar',
            });

            // Verificar si el usuario confirmó la actualización
            if (confirmAction.isConfirmed) {
                const response = await invoiceService.updateInvoice(InvoiceId, viewData);
                if (response.status == 200) {
                    router.push('/invoices');
                    Swal.fire({
                        title: 'Actualización de Cotización',
                        text: 'Se actualizó satisfactoriamente la cotización',
                        icon: 'success',
                        confirmButtonText: 'OK',
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: 'Hubo un error al actualizar la cotización',
                        icon: 'error',
                        confirmButtonText: 'OK',
                    });
                }
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Hubo un error al actualizar la cotización',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    const createInvoice = async (data) => {
        try {
            // Mostrar el diálogo de confirmación
            const confirmAction = await Swal.fire({
                title: 'Confirmar creación',
                text: '¿Está seguro de crear esta cotización?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, crear',
                cancelButtonText: 'Cancelar',
            });

            // Verificar si el usuario confirmó la creación
            if (confirmAction.isConfirmed) {
                const response = await invoiceService.createInvoice(data);

                if (response.status == 200) {
                    router.push('/invoices');
                    Swal.fire({
                        title: 'Creación de Cotización',
                        text: 'Se creó satisfactoriamente la cotización',
                        icon: 'success',
                        confirmButtonText: 'OK',
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: 'Hubo un error al crear la cotización',
                        icon: 'error',
                        confirmButtonText: 'OK',
                    });
                }
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Hubo un error al crear la cotización',
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
    const getFleteCost = () => {
        let totalCost = 0;

        for (const district of fletesJson) {
            if (district.District === selectedDistrict) {
                totalCost += (truck9TN * district["09_TN"]) + (truck20TN * district["20_TN"]) + (truck32TN * district["32_TN"]);
            }
        }

        return totalCost;
    };
    const getCantParihuela = () => {
        let cantParihuela = 0;
        for (let i = 0; i < selectedMeasures.length; i++) {
            const measureInfo = uniconJson.find(item => item.Description === selectedMeasures[i]);
            const unitForPari = measureInfo ? measureInfo.UnitForPari : 0;
            cantParihuela += measureQuantities[i] / unitForPari;
        }
        return cantParihuela.toFixed(0);
    };
    const getSubtotal = () => {
        let subtotal = 0;
        for (let i = 0; i < selectedMeasures.length; i++) {
            const measureInfo = uniconJson.find(item => item.Description === selectedMeasures[i]);
            let pu2 = 0;
            if (deliveryType == "PUESTO EN OBRA" && isParihuelaNeeded == "Sí" && getPiecesTotal() > 1000) {
                pu2 = measureInfo.Price + parseFloat(prorrateoParihuela()) + parseFloat(prorrateoFlete())
            }
            else if (deliveryType == "PUESTO EN OBRA" && isParihuelaNeeded != "Sí" && getPiecesTotal() > 1000) {
                pu2 = measureInfo.Price + parseFloat(prorrateoFlete())
            }
            else {
                pu2 = measureInfo.Price
            }
            const price = measureInfo ? pu2 : 0;
            subtotal += measureQuantities[i] * price;
        }
        return subtotal;
    };

    const getIGV = (subtotal) => {
        const igvRate = 0.18; // 18%
        return (subtotal * igvRate);
    };

    const getTotal = (subtotal, igv) => {
        return subtotal + igv;
    };
    const handleTruck9TNChange = (event) => {
        setTruck9TN(event.target.value);
    };

    const handleTruck20TNChange = (event) => {
        setTruck20TN(event.target.value);
    };

    const handleTruck32TNChange = (event) => {
        setTruck32TN(event.target.value);
    };

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

        const productsData = selectedMeasures.map((measure, index) => {
            const measureInfo = uniconJson.find(item => item.Description === measure);
            let pu = 0;
            if (deliveryType === "PUESTO EN OBRA" && isParihuelaNeeded === "Sí" && getPiecesTotal() > 1000) {
                pu = measureInfo.Price + parseFloat(prorrateoParihuela()) + parseFloat(prorrateoFlete())
            }
            else if (deliveryType === "PUESTO EN OBRA" && isParihuelaNeeded !== "Sí" && getPiecesTotal() > 1000) {
                pu = measureInfo.Price + parseFloat(prorrateoFlete())
            }
            else {
                pu = measureInfo.Price
            }
            const priceUnit = measureInfo ? pu : 0;
            const totalPrice = measureQuantities[index] * priceUnit;

            return {
                Product: measure,
                Quantity: measureQuantities[index],
                PriceUnit: priceUnit,
                TotalPrice: totalPrice
            };
        });

        const fleteList = fletesJson
            .filter(district => district.District === selectedDistrict)
            .map(district => ({
                Truck: '9 TN',
                CountTruck: (getTotalWeight() / 9000).toFixed(3),
                TructQuantity: truck9TN,
                TruckPrice: district['09_TN'],
            }))
            .concat({
                Truck: '20 TN',
                CountTruck: (getTotalWeight() / 20000).toFixed(3),
                TructQuantity: truck20TN,
                TruckPrice: fletesJson[0]['20_TN'],
            })
            .concat({
                Truck: '32 TN',
                CountTruck: (getTotalWeight() / 32000).toFixed(3),
                TructQuantity: truck32TN,
                TruckPrice: fletesJson[0]['32_TN'],
            });

        const unitPiece = uniconJson.find(item => item.Category === selectedCategory)?.Unit;

        const viewData = {
            identificationType,
            documentInfo,
            identificationInfo,
            telephone,
            email,
            selectedCategory,
            selectedMeasures,
            measureQuantities,
            deliveryType,
            selectedDistrict,
            truck9TN,
            truck20TN,
            truck32TN,
            isParihuelaNeeded,
            cantParihuela: deliveryType === "PUESTO EN OBRA" ? cantParihuela : 0,
            costParihuela: deliveryType === "PUESTO EN OBRA" ? costParihuela : 0,
            address,
            reference,
            totalPriceParihuela: updateTotalParihuela() || 0,
            productsList: productsData,
            fleteList,
            contact,
            totalWeight: getTotalWeight() || 0,
            totalOfPieces: getPiecesTotal() || 0,
            unitPiece: unitPiece,
            subtotal: getSubtotal() || 0,
            igvRate: getIGV(getSubtotal()) || 0,
            totalInvoice: getTotal(getSubtotal(), getIGV(getSubtotal())) || 0,
            createdBy: sessionStorage.getItem('userEmail'),
            userId: sessionStorage.getItem('identificator')
        };

        if (action === "update") {
            updateInvoice(viewData);
        } else if (action === "create") {
            createInvoice(viewData);
        }
    };


    const AutopopulatedFunction = (viewData) => {

        setIdentificationType(viewData.identificationType);
        setDocumentInfo(viewData.documentInfo);
        setIdentificationInfo(viewData.identificationInfo);
        setTelephone(viewData.telephone);
        setEmail(viewData.email);
        setSelectedCategory(viewData.selectedCategory);
        const measuresForCategory = uniconJson
            .filter(item => item.Category === viewData.selectedCategory)
            .map(item => item.Description);
        setMeasuresOptions(measuresForCategory);
        setSelectedMeasures(viewData.selectedMeasures);
        setMeasureQuantities(viewData.measureQuantities);
        setDeliveryType(viewData.deliveryType);
        setSelectedDistrict(viewData.selectedDistrict);
        setTruck9TN(viewData.truck9TN);
        setTruck20TN(viewData.truck20TN);
        setTruck32TN(viewData.truck32TN);
        setIsParihuelaNeeded(viewData.isParihuelaNeeded);
        setCantParihuela(viewData.cantParihuela);
        setCostParihuela(viewData.costParihuela);
        setAddress(viewData.address);
        setReference(viewData.reference);
        setContact(viewData.contact);
        setIsAutopopulated(true);


    };

    const handleCantParihuelaChange = (event) => {
        setCantParihuela(event.target.value);
    };
    const handlecostParihuelaChange = (event) => {
        setCostParihuela(event.target.value);
    };
    const [isAutopopulated, setIsAutopopulated] = useState(false);
    const [cantParihuela, setCantParihuela] = useState(0);
    const [costParihuela, setCostParihuela] = useState(20);

    useEffect(() => {
        if (!isAutopopulated) {
            setCantParihuela(parseInt(getCantParihuela()));
        }
    }, [isAutopopulated, selectedMeasures, measureQuantities]);
    const updateTotalParihuela = () => {
        const totalValue = cantParihuela * costParihuela;
        return isNaN(totalValue) ? 0 : totalValue;
    };
    const prorrateoParihuela = () => {
        let cont = 0;
        cont = updateTotalParihuela() / getPiecesTotal();
        return cont.toFixed(2);
    }
    const prorrateoFlete = () => {
        let aux = 0;
        aux = (getFleteCost() * 0.82) / getPiecesTotal();
        return aux.toFixed(2);
    }
    const resetPuestoEnObra = () => {
        if (deliveryType === "PUESTO EN PLANTA") {
            setAddress('');
            setSelectedDistrict('');
            setTruck9TN(0);
            setTruck20TN(0);
            setTruck32TN(0);
            setIsParihuelaNeeded('');
            setCantParihuela(0);
        }
    }
    const [selectedOption, setSelectedOption] = useState('');
    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };
    const handleAutocompleteCustomer = (value) => {
        console.log(value);

        setIdentificationInfo(value?.value?.customerName || "");
        setDocumentInfo(value?.value?.identificationInfo || "");

    }
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

                <Box flex={1} marginRight={5} marginLeft={{ md: -20 }}>
                    <Typography variant="h4" style={{ fontSize: '28px' }}>{!InvoiceId ? "Nueva Cotización" : "Edición " + parsedInvoice?.invoiceCode}</Typography><br />
                    <label>Tipo de identificación<font color="red"> *</font></label>
                    <FormControl fullWidth>
                        <Select value={identificationType} onChange={handleIdentificationTypeChange}>
                            <MenuItem value="DNI">DNI</MenuItem>
                            <MenuItem value="RUC">RUC</MenuItem>
                        </Select>
                    </FormControl>
                    <br /><br />

                    <FormControl fullWidth>
                        <TextField
                            label={identificationType === 'DNI' ? <span>DNI <font color="red">*</font></span> : <span>RUC <font color="red">*</font></span>}
                            value={documentInfo}
                            onChange={handleDocumentInfoChange}
                            type='number'
                            disabled={!identificationType}
                            fullWidth
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end" >
                                        <IconButton edge="start" onClick={() => { setEditModalOpen(true) }} disabled={!identificationType}>
                                            <Visibility />
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
                            label={identificationType === 'DNI' ? <span>Nombre completo <font color="red">*</font></span> : <span>Razón social <font color="red">*</font></span>}
                            value={identificationInfo}
                            onChange={handleIdentificationInfoChange}
                            fullWidth
                        // inputProps={{ readOnly: true }}
                        />
                    </FormControl>
                    <br /><br />

                    <FormControl fullWidth>
                        <TextField
                            label="Teléfono Celular"
                            type='number'
                            value={telephone}
                            onChange={handleTelephoneChange}
                            fullWidth
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
                    <br /><br />
                    <FormControl fullWidth>
                        <TextField
                            label="Correo Electrónico"
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            fullWidth
                        />
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
                    <br /><br />

                    {selectedCategory && (
                        <FormControl fullWidth>
                            <label>
                                Medidas
                                <font color="red"> *</font>
                            </label>

                            <Autocomplete
                                multiple
                                options={measuresOptions}
                                value={selectedMeasures}
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
                    )}

                    {selectedCategory && selectedMeasures && (
                        <FormControl fullWidth>
                            <br></br>
                            <label>
                                Tipo de entrega
                                <font color="red"> *</font>
                            </label>
                            <Select value={deliveryType} onChange={handleDeliveryTypeChange}>
                                <MenuItem value="PUESTO EN PLANTA">PUESTO EN PLANTA</MenuItem>
                                <MenuItem value="PUESTO EN OBRA">PUESTO EN OBRA</MenuItem>
                            </Select>
                        </FormControl>
                    )}



                </Box>
                {selectedMeasures && deliveryType !== '' && (
                    <Box flex={0.6} marginRight={5} marginTop={{ xs: 1.8, md: 0 }}>
                        {/* <FormControl fullWidth>
                            <label>
                                Tipo de entrega
                                <font color="red"> *</font>
                            </label>
                            <Select value={deliveryType} onChange={handleDeliveryTypeChange}>
                                <MenuItem value="PUESTO EN PLANTA">PUESTO EN PLANTA</MenuItem>
                                <MenuItem value="PUESTO EN OBRA">PUESTO EN OBRA</MenuItem>
                            </Select>
                        </FormControl>
                        <br></br><br></br> */}
                        {deliveryType === "PUESTO EN PLANTA" && (
                            <FormControl fullWidth>
                                <label>
                                    Dirección
                                    <font color="red"> *</font>
                                </label>
                                <Select value={address} onChange={handleAddressChange}>
                                    <MenuItem value="Jr Placido Jiménez 790 Cercado de Lima">Jr Placido Jiménez 790 Cercado de Lima</MenuItem>
                                    <MenuItem value="Av. Camino Principal Lote 80 Urb. Parcela Cajamarquilla">Av. Camino Principal Lote 80 Urb. Parcela Cajamarquilla</MenuItem>
                                </Select><br />
                                <label>Referencia</label>
                                <FormControl fullWidth>
                                    <TextField
                                        multiline
                                        type="text"
                                        value={reference}
                                        onChange={handleReferenceChange}
                                        fullWidth
                                    />
                                </FormControl>
                            </FormControl>
                        )}
                        {deliveryType === "PUESTO EN OBRA" && (
                            <Box >
                                <label>Dirección</label>
                                <FormControl fullWidth>
                                    <TextField
                                        multiline
                                        type="text"
                                        value={address}
                                        onChange={handleAddressChange}
                                        fullWidth
                                    />
                                </FormControl>
                                <br /><br />
                                <label>Referencia</label>
                                <FormControl fullWidth>
                                    <TextField
                                        multiline
                                        type="text"
                                        value={reference}
                                        onChange={handleReferenceChange}
                                        fullWidth
                                    />
                                </FormControl><br /><br />
                                <FormControl fullWidth>
                                    <label>Seleccione distrito<font color="red"> *</font></label>
                                    <Autocomplete
                                        value={selectedDistrict}
                                        onChange={(event, value) => handleDistrictChange({ target: { value } })}
                                        options={fletesJson.map((district) => district.District)}
                                        renderInput={(params) => (
                                            <TextField {...params} variant="outlined" />
                                        )}
                                    />
                                </FormControl>
                                <br /><br />
                                {deliveryType === "PUESTO EN OBRA" && selectedDistrict && (
                                    <table style={tableStyle}>
                                        <thead>
                                            <tr>
                                                <th style={thTdStyle}>Camion</th>
                                                <th style={thTdStyle}>N° de carros</th>
                                                <th style={thTdStyle}>Cantidad</th>
                                                <th style={thTdStyle}>Costo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fletesJson.map((district) => {
                                                if (district.District === selectedDistrict) {
                                                    return (
                                                        <React.Fragment key={district.District}>
                                                            <tr style={hoverStyle}>
                                                                <td style={thTdStyle}>9 TN</td>
                                                                <td style={thTdStyle}>{(getTotalWeight() / 9000).toFixed(3)} </td>
                                                                <td style={thTdStyle}>
                                                                    <TextField
                                                                        error={truck9TN === null || truck9TN === '' || truck9TN < 0}
                                                                        type="number"
                                                                        fullWidth
                                                                        value={truck9TN}
                                                                        onChange={handleTruck9TNChange}
                                                                    />
                                                                </td>
                                                                <td style={thTdStyle}>{(district["09_TN"]).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}</td>
                                                            </tr>
                                                            <tr style={hoverStyle}>
                                                                <td style={thTdStyle}>20 TN</td>
                                                                <td style={thTdStyle}>{(getTotalWeight() / 20000).toFixed(3)} </td>
                                                                <td style={thTdStyle}>
                                                                    <TextField
                                                                        error={truck20TN === null || truck20TN === '' || truck20TN < 0}
                                                                        type="number"
                                                                        fullWidth
                                                                        value={truck20TN}
                                                                        onChange={handleTruck20TNChange}
                                                                    />
                                                                </td>
                                                                <td style={thTdStyle}>{(district["20_TN"]).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}</td>
                                                            </tr>
                                                            <tr style={hoverStyle}>
                                                                <td style={thTdStyle}>32 TN</td>
                                                                <td style={thTdStyle}>{(getTotalWeight() / 32000).toFixed(3)}</td>
                                                                <td style={thTdStyle}>
                                                                    <TextField
                                                                        error={truck32TN === null || truck32TN === '' || truck32TN < 0}
                                                                        type="number"
                                                                        fullWidth
                                                                        value={truck32TN}
                                                                        onChange={handleTruck32TNChange}
                                                                    />
                                                                </td>
                                                                <td style={thTdStyle}>{(district["32_TN"]).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}</td>
                                                            </tr>
                                                        </React.Fragment>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </tbody>
                                    </table>
                                )}
                                <FormControl fullWidth>
                                    <label>
                                        ¿Requiere Parihuela?<font color="red"> *</font>
                                    </label>
                                    <Select value={isParihuelaNeeded} onChange={handleParihuelaChange}>
                                        <MenuItem value="Sí">Sí</MenuItem>
                                        <MenuItem value="No">No</MenuItem>
                                    </Select>
                                </FormControl>
                                <br></br><br></br>
                                {isParihuelaNeeded == "Sí" && (
                                    <table style={tableStyle}>
                                        <thead>
                                            <tr>
                                                <th style={thTdStyle}>Cant. Parihuela</th>
                                                <th style={thTdStyle}>Precio</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr style={hoverStyle}>
                                                <td style={thTdStyle}>
                                                    <TextField
                                                        error={cantParihuela === null || cantParihuela === '' || cantParihuela < 0}
                                                        type='number'
                                                        value={cantParihuela}
                                                        onChange={handleCantParihuelaChange}
                                                        fullWidth
                                                    />
                                                </td>
                                                <td style={thTdStyle}>
                                                    <TextField
                                                        error={costParihuela === null || costParihuela === '' || costParihuela < 0}
                                                        label="S/."
                                                        type='number'
                                                        value={costParihuela}
                                                        onChange={handlecostParihuelaChange}
                                                        fullWidth
                                                    />
                                                </td>
                                            </tr>
                                            <tr style={hoverStyle}>
                                                <td style={thTdStyle}>Total S/.</td>
                                                <td style={thTdStyle}>{(updateTotalParihuela() || 0).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                )}
                            </Box>
                        )}
                    </Box>

                )}
                {selectedMeasures.length > 0 && (
                    <Box flex={1.4} marginRight={-20} marginTop={{ xs: 1.8, md: 0 }}>
                        <Typography variant="h6" >
                            Bloques seleccionados
                        </Typography>
                        <br />
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thTdStyle}>Producto</th>
                                    <th style={thTdStyle}>
                                        Cantidad <font color="red">*</font>
                                    </th>
                                    <th style={thTdStyle}>Precio Unitario</th>
                                    <th style={thTdStyle}>Total</th>
                                    <th style={thTdStyle}>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedMeasures.map((measure, index) => {
                                    const measureInfo = uniconJson.find(item => item.Description === measure);
                                    let pu = 0;
                                    if (deliveryType == "PUESTO EN OBRA" && isParihuelaNeeded == "Sí" && getPiecesTotal() > 1000) {
                                        pu = measureInfo.Price + parseFloat(prorrateoParihuela()) + parseFloat(prorrateoFlete())
                                    }
                                    else if (deliveryType == "PUESTO EN OBRA" && isParihuelaNeeded != "Sí" && getPiecesTotal() > 1000) {
                                        pu = measureInfo.Price + parseFloat(prorrateoFlete())
                                    }
                                    else {
                                        pu = measureInfo.Price
                                    }
                                    const precioUnitario = measureInfo ? (pu) : 0;
                                    const total = measureQuantities[index] * precioUnitario;

                                    return (
                                        <tr key={index} style={hoverStyle}>
                                            <td style={thTdStyle}>{measure}</td>
                                            <td style={thTdStyle}>
                                                <TextField
                                                    error={measureQuantities[index] === null || measureQuantities[index] === '' || isNaN(measureQuantities[index]) || measureQuantities[index] <= 0}
                                                    type="number"
                                                    fullWidth
                                                    value={measureQuantities[index]}
                                                    onChange={(event) => handleQuantityChange(event, index)}
                                                />
                                            </td>
                                            <td style={thTdStyle}>{(precioUnitario || 0).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}</td>
                                            <td style={thTdStyle}>{(total || 0).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}</td>
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
                        {selectedMeasures.length > 0 && (
                            <Typography variant="h6" style={{ float: 'right' }}>
                                PESO TOTAL: {getTotalWeight() > 1000 ? `${(getTotalWeight() / 1000).toFixed(2)} TN` : `${getTotalWeight().toFixed(2)} KG`}
                            </Typography>
                        )}<br />

                        {selectedMeasures.length > 0 && (
                            <Typography variant="h6" style={{ float: 'right' }}>
                                SUBTOTAL: {(getSubtotal() || 0).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                            </Typography>
                        )}<br />

                        {selectedMeasures.length > 0 && (
                            <Typography variant="h6" style={{ float: 'right' }}>
                                IGV 18%: {(getIGV(getSubtotal()) || 0).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                            </Typography>
                        )}<br />

                        {selectedMeasures.length > 0 && (
                            <Typography variant="h6" style={{ float: 'right' }}>
                                TOTAL: {(getTotal(getSubtotal(), getIGV(getSubtotal())) || 0).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                            </Typography>
                        )}<br />
                        <br />
                        <Box style={{ float: 'right', marginTop: 80 }}>
                            <Button variant="outlined" color="primary" style={{ marginRight: 8 }} onClick={() => { router.push('/invoices') }}>
                                Cerrar
                            </Button>

                            {!InvoiceId && (
                                <Button variant="contained" color="primary" onClick={() => handleCot("create")}>
                                    Crear
                                </Button>
                            )}

                            {InvoiceId && (
                                <Button variant="contained" color="primary" onClick={() => handleCot("update")}>
                                    Actualizar
                                </Button>
                            )}
                        </Box>

                    </Box>
                )}
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
                                            label="Nombre del Cliente"
                                            sx={{ width: '240px' }}
                                            value={filterName}
                                            onChange={(event) => setFilterName(event.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                            sx={{ width: '240px' }}
                                            label="Número de Identificación"
                                            value={filterIdentificationInfo}
                                            onChange={(event) => setFilterIdentificationInfo(event.target.value)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody style={{ cursor: 'pointer' }}>
                                    {customers?.map((customer) => (
                                        <TableRow key={customer.id} onClick={() => handleRowClick(customer)}>
                                            <TableCell>{customer.customerName}</TableCell>
                                            <TableCell>{customer.identificationInfo}</TableCell>
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

            <Box style={{ float: 'right', marginTop: 2, paddingRight: 60 }}>
                <Box style={{ float: 'right', marginTop: 2, paddingRight: 16 }}>

                </Box>
            </Box>
        </Container>

    );


};

Page.propTypes = {
    // ... (propTypes for Page component if needed)
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
