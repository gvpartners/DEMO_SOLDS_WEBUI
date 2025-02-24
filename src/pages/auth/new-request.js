import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { Button, TextField, Container, Typography, Select, MenuItem, FormControl, InputLabel, Table, TableHead, TableRow, TableCell, TableBody, Box, Autocomplete } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Swal from 'sweetalert2';
import invoiceService from 'src/services/invoiceService';
import uniconJson from 'src/config/unicon.json';
import fletesJson from 'src/config/fletes.json';
import authService from 'src/services/authService';

const RequestForm = () => {
    const router = useRouter();
    let { userId } = router.query;
    const categories = [...new Set(uniconJson.map(item => item.Category))];
    const deliveryTypes = ["ENTREGADO EN PLANTA", "PUESTO EN OBRA"];
    const districts = fletesJson.map(item => item.District);
    const plantAddresses = [
        "Jr Placido Jiménez 790 Cercado de Lima",
        "Av. Camino Principal Lote 80 Urb. Parcela Cajamarquilla"
    ];
    const [formData, setFormData] = useState({
        identificationType: "RUC",
        documentInfo: "",
        identificationInfo: "",
        telephone: "",
        email: "",
        contact: "",
        selectedCategory: "",
        selectedMeasures: [],
        measureQuantities: [],
        deliveryType: "",
        selectedDistrict: "",
        address: "",
        reference: "",
        createdBy: "",
        userId: ""
    });
    const [requestCode, setRequestCode] = useState(null);
    const [employeePhone, setEmployeePhone] = useState(null);
    const [employeeFullName, setEmployeeFullName] = useState(null);
    const [employeePrefix, setEmployeePrefix] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (userId) {
            setFormData(prev => ({ ...prev, userId }));
        }
    }, [userId]);

    const [measuresOptions, setMeasuresOptions] = useState([]);

    useEffect(() => {
        setMeasuresOptions(
            formData.selectedCategory ? uniconJson.filter(item => item.Category === formData.selectedCategory).map(item => item.Description) : []
        );
    }, [formData.selectedCategory]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            let updatedData = { ...prev, [name]: value };
            if (name === "deliveryType") {
                updatedData.address = "";
                updatedData.selectedDistrict = "";
            }
            if (name === "selectedCategory") {
                updatedData.selectedMeasures = [];
                updatedData.measureQuantities = [];
            }
            if (name === "address") {
                if (value === "Jr Placido Jiménez 790 Cercado de Lima") {
                    updatedData.selectedDistrict = "EL AGUSTINO";
                } else if (value === "Av. Camino Principal Lote 80 Urb. Parcela Cajamarquilla") {
                    updatedData.selectedDistrict = "LURIGANCHO (AV.CAJAMARQUILLA)";
                }
            }
            return updatedData;
        });
    };

    const handleMeasureChange = (event, value) => {
        setFormData(prev => ({
            ...prev,
            selectedMeasures: value,
            measureQuantities: value.map((_, index) => Number(prev.measureQuantities[index]) || 0)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = ["documentInfo", "identificationInfo", "telephone", "email", "selectedCategory", "deliveryType", "address", "contact"];
        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = "Este campo es obligatorio";
            }
        });

        if (formData.selectedMeasures.length === 0) {
            newErrors.selectedMeasures = "Debe seleccionar al menos una medida";
        }

        formData.measureQuantities.forEach((quantity, index) => {
            if (quantity <= 0) {
                newErrors[`measureQuantities_${index}`] = "La cantidad debe ser mayor que cero";
            }
        });

        if (!/^\d{9}$/.test(formData.telephone)) {
            newErrors.telephone = "El número de teléfono debe tener 9 dígitos";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Ingrese un correo electrónico válido";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateRequest = async () => {
        if (!formData.userId) {
            Swal.fire({
                title: 'Advertencia',
                text: 'Solicite al ejecutivo un nuevo link.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (!validateForm()) {
            return;
        }

        try {
            const res = await authService.createRequest(formData);
            const generatedRequestCode = "COT-" + res.employeePrefix + res.invoiceCode.padStart(7, '0');
            setRequestCode(generatedRequestCode);
            setEmployeePhone(res.employeePhone);
            setEmployeeFullName(res.employeeFullName);
            setEmployeePrefix(res.employeePrefix);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Hubo un problema al generar la solicitud.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    if (requestCode) {
        const now = new Date();
        const requestDate = now.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const requestTime = now.toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        const message = `Estimado/a ${employeeFullName}, mi solicitud ${requestCode}  ha sido enviada el día ${requestDate} a las ${requestTime}.`;
        const whatsappLink = `https://wa.me/51${employeePhone}?text=${encodeURIComponent(message)}`;

        return (
            <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 80 }} />
                <Typography variant="h5" sx={{ marginTop: 2 }}>¡Solicitud Creada!</Typography>
                <Typography variant="h6" sx={{ marginTop: 1 }}>Código: {requestCode}</Typography>
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<WhatsAppIcon />}
                    sx={{ marginTop: 3 }}
                    onClick={() => window.open(whatsappLink, '_blank')}
                >
                    Reportar al Ejecutivo
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Typography paddingTop={2} variant="h4" gutterBottom>Crear Solicitud</Typography>
            <Typography color="primary" paddingTop={2} paddingBottom={1} variant="h6">Información del Solicitante</Typography>
            <TextField
                label="Número de RUC"
                name="documentInfo"
                type="number"
                value={formData.documentInfo}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                error={!!errors.documentInfo}
                helperText={errors.documentInfo}
            />
            <TextField
                label="Razón Social"
                name="identificationInfo"
                value={formData.identificationInfo}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                error={!!errors.identificationInfo}
                helperText={errors.identificationInfo}
            />
            <TextField
                label="Nombre del solicitante"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                error={!!errors.contact}
                helperText={errors.contact}
            />
            <TextField
                label="Correo Electrónico"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                error={!!errors.email}
                helperText={errors.email}
            />
            <TextField
                label="Teléfono de contacto"
                name="telephone"
                type="number"
                value={formData.telephone}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                error={!!errors.telephone}
                helperText={errors.telephone}
            />
            <Typography color="primary" paddingTop={2} paddingBottom={1} variant="h6">Información de Entrega</Typography>
            <FormControl fullWidth margin="normal" error={!!errors.deliveryType}>
                <InputLabel>Tipo de Entrega *</InputLabel>
                <Select name="deliveryType" value={formData.deliveryType} onChange={handleChange} required>
                    {deliveryTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select>
                {errors.deliveryType && <Typography color="error" variant="body2">{errors.deliveryType}</Typography>}
            </FormControl>
            {formData.deliveryType === "PUESTO EN OBRA" && (
                <Autocomplete
                    options={districts}
                    value={formData.selectedDistrict}
                    onChange={(event, value) => handleChange({ target: { name: "selectedDistrict", value } })}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Distrito"
                            fullWidth
                            margin="normal"
                            required
                            error={!!errors.selectedDistrict}
                            helperText={errors.selectedDistrict}
                        />
                    )}
                />
            )}
            {formData.deliveryType === "PUESTO EN OBRA" && (
                <TextField
                    label="Dirección"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    error={!!errors.address}
                    helperText={errors.address}
                />
            )}
            {formData.deliveryType === "ENTREGADO EN PLANTA" && (
                <FormControl fullWidth margin="normal" error={!!errors.address}>
                    <InputLabel>Dirección *</InputLabel>
                    <Select name="address" value={formData.address} onChange={handleChange} required>
                        {plantAddresses.map(address => <MenuItem key={address} value={address}>{address}</MenuItem>)}
                    </Select>
                    {errors.address && <Typography color="error" variant="body2">{errors.address}</Typography>}
                </FormControl>
            )}
            <Typography color="primary" paddingTop={2} paddingBottom={1} variant="h6">Selección de Productos</Typography>
            <FormControl fullWidth margin="normal" error={!!errors.selectedCategory}>
                <InputLabel>Categoría *</InputLabel>
                <Select name="selectedCategory" value={formData.selectedCategory} onChange={handleChange} required>
                    {categories.map(category => <MenuItem key={category} value={category}>{category}</MenuItem>)}
                </Select>
                {errors.selectedCategory && <Typography color="error" variant="body2">{errors.selectedCategory}</Typography>}
            </FormControl>
            <Autocomplete
                readOnly={!formData.selectedCategory}
                disabled={!formData.selectedCategory}
                multiple
                options={measuresOptions}
                value={formData.selectedMeasures}
                onChange={handleMeasureChange}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Medidas *"
                        fullWidth
                        margin="normal"
                        error={!!errors.selectedMeasures}
                        helperText={errors.selectedMeasures}
                    />
                )}
            />
            <br></br>
            {formData.selectedMeasures.length > 0 && (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Producto</TableCell>
                            <TableCell>Cantidad</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {formData.selectedMeasures.map((measure, index) => (
                            <TableRow key={index}>
                                <TableCell>{measure}</TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        value={formData.measureQuantities[index] || ''}
                                        fullWidth
                                        onChange={(e) => {
                                            const newValue = Math.max(0, Number(e.target.value) || '');
                                            const updatedQuantities = [...formData.measureQuantities];
                                            updatedQuantities[index] = newValue;
                                            setFormData(prev => ({ ...prev, measureQuantities: updatedQuantities }));
                                        }}
                                        error={!!errors[`measureQuantities_${index}`]}
                                        helperText={errors[`measureQuantities_${index}`]}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <Button variant="contained" color="primary" onClick={handleCreateRequest} fullWidth sx={{ mt: 3 }}>Crear Solicitud</Button>
        </Container>
    );
};

export default RequestForm;