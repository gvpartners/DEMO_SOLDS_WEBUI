import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react'; // Añade useEffect aquí
import Swal from 'sweetalert2';
import {
    Container, TextField, Typography, Table, TableHead, TableRow, TableCell, TableBody,
    Button, Box, TableContainer, Paper, Select, MenuItem, FormControl, InputLabel, FormHelperText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import authService from 'src/services/authService';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const visitReasons = ["Visita técnica", "Charla técnica", "Otro"];

const NewVisitForm = () => {
    const router = useRouter();
    let { userId } = router.query;
    const [formData, setFormData] = useState({
        client: '',
        work: '',
        workAddress: '',
        visitReason: '',
        otherReason: '',
        createdBy: userId,
        contacts: [{ fullName: '', position: '', email: '', phone: '' }]
    });

    const [errors, setErrors] = useState({
        client: false,
        work: false,
        workAddress: false,
        visitReason: false,
        otherReason: false,
        contacts: []
    });

    useEffect(() => {
        if (userId) {
            setFormData(prev => ({ ...prev, createdBy: userId })); // Corrige createdBy a userId
        }
    }, [userId]);

    const [success, setSuccess] = useState(false);
    const [visitCode, setVisitCode] = useState('');
    const [employeePhone, setEmployeePhone] = useState('');
    const [employeeFullName, setEmployeeFullName] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: false });
    };

    const addContact = () => {
        setFormData({
            ...formData,
            contacts: [...formData.contacts, { fullName: '', position: '', email: '', phone: '' }]
        });
        setErrors({ ...errors, contacts: [...errors.contacts, { fullName: false, position: false, email: false, phone: false }] });
    };

    const handleContactChange = (index, field, value) => {
        const updatedContacts = formData.contacts.map((contact, i) =>
            i === index ? { ...contact, [field]: value } : contact
        );
        const updatedErrors = errors.contacts.map((contact, i) =>
            i === index ? { ...contact, [field]: false } : contact
        );
        setFormData({ ...formData, contacts: updatedContacts });
        setErrors({ ...errors, contacts: updatedErrors });
    };

    const removeContact = (index) => {
        const updatedContacts = formData.contacts.filter((_, i) => i !== index);
        const updatedErrors = errors.contacts.filter((_, i) => i !== index);
        setFormData({ ...formData, contacts: updatedContacts });
        setErrors({ ...errors, contacts: updatedErrors });
    };

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validateForm = () => {
        let newErrors = {
            client: formData.client.trim() === '',
            work: formData.work.trim() === '',
            workAddress: formData.workAddress.trim() === '',
            visitReason: formData.visitReason.trim() === '',
            otherReason: formData.visitReason === "Otro" && formData.otherReason.trim() === '',
            contacts: formData.contacts.map(contact => ({
                fullName: contact.fullName.trim() === '',
                position: contact.position.trim() === '',
                email: !validateEmail(contact.email.trim()),
                phone: contact.phone.trim() === ''
            }))
        };

        setErrors(newErrors);

        if (
            newErrors.client || newErrors.work || newErrors.workAddress ||
            newErrors.visitReason || newErrors.otherReason ||
            newErrors.contacts.some(contact => contact.fullName || contact.position || contact.email || contact.phone)
        ) {
            Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                text: 'Por favor, complete todos los campos obligatorios y asegúrese de que los correos sean válidos.',
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const data = await authService.createVisit(formData);
            
            setVisitCode(`VT-${data.employeePrefix}${data.visitCode.padStart(7, '0')}`);
            setSuccess(true);
            setEmployeePhone(data.employeePhone);
            setEmployeeFullName(data.createdBy);
        } catch (error) {
            Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                text: 'Solicte un nuevo link para registrar su visita.',
            });
        }
    };

    if (success) {
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

        const message = `Estimado/a ${employeeFullName}, mi solicitud de visita ${visitCode} ha sido enviada el día ${requestDate} a las ${requestTime}.`;
        const whatsappLink = `https://wa.me/51${employeePhone}?text=${encodeURIComponent(message)}`;

        return (
            <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 80 }} />
                <Typography variant="h5" sx={{ marginTop: 2 }}>Visita en proceso</Typography>
                <Typography variant="h6" sx={{ marginTop: 1 }}>Código: {visitCode}</Typography>
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
            <Typography paddingTop={3} variant="h4" gutterBottom>Registrar visita técnica</Typography>

            <TextField
                label="Cliente"
                name="client"
                value={formData.client}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                error={errors.client}
                helperText={errors.client ? "Este campo es obligatorio" : ""}
            />
            <TextField
                label="Obra"
                name="work"
                value={formData.work}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                error={errors.work}
                helperText={errors.work ? "Este campo es obligatorio" : ""}
            />
            <TextField
                label="Dirección de Obra"
                name="workAddress"
                value={formData.workAddress}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                error={errors.workAddress}
                helperText={errors.workAddress ? "Este campo es obligatorio" : ""}
            />

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                <Typography variant="h6" gutterBottom>Contactos</Typography>
                <Button variant="contained" color="primary" onClick={addContact}>+ Añadir Contacto</Button>
            </Box>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre Completo</TableCell>
                            <TableCell>Cargo</TableCell>
                            <TableCell>Correo</TableCell>
                            <TableCell>Celular</TableCell>
                            <TableCell>Acción</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {formData.contacts.map((contact, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <TextField
                                        style={{ width: '100%', minWidth: '200px' }}
                                        value={contact.fullName}
                                        onChange={(e) => handleContactChange(index, 'fullName', e.target.value)}
                                        fullWidth
                                        error={errors.contacts[index]?.fullName}
                                        helperText={errors.contacts[index]?.fullName ? "Este campo es obligatorio" : ""}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        style={{ width: '100%', minWidth: '100px' }}
                                        value={contact.position}
                                        onChange={(e) => handleContactChange(index, 'position', e.target.value)}
                                        fullWidth
                                        error={errors.contacts[index]?.position}
                                        helperText={errors.contacts[index]?.position ? "Este campo es obligatorio" : ""}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        style={{ width: '100%', minWidth: '200px' }}
                                        type="email"
                                        value={contact.email}
                                        onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                                        fullWidth
                                        error={errors.contacts[index]?.email}
                                        helperText={errors.contacts[index]?.email ? "Correo no válido" : ""}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        style={{ width: '100%', minWidth: '100px' }}
                                        type="number"
                                        value={contact.phone}
                                        onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                                        fullWidth
                                        error={errors.contacts[index]?.phone }
                                        helperText={errors.contacts[index]?.phone ? "Este campo es obligatorio" : ""}
                                    />
                                </TableCell>
                                <TableCell>
                                    <DeleteIcon onClick={() => removeContact(index)} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Motivo de Visita</Typography>
            <FormControl fullWidth margin="normal" error={errors.visitReason}>
                <InputLabel>Seleccione el motivo</InputLabel>
                <Select
                    name="visitReason"
                    value={formData.visitReason}
                    onChange={(e) => {
                        setFormData({ ...formData, visitReason: e.target.value, otherReason: '' });
                        setErrors({ ...errors, visitReason: false, otherReason: false });
                    }}
                >
                    {visitReasons.map((reason) => (
                        <MenuItem key={reason} value={reason}>{reason}</MenuItem>
                    ))}
                </Select>
                {errors.visitReason && <FormHelperText>Este campo es obligatorio</FormHelperText>}
            </FormControl>

            {formData.visitReason === "Otro" && (
                <TextField
                    label="Especifique otro motivo"
                    name="otherReason"
                    value={formData.otherReason}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                    error={errors.otherReason}
                    helperText={errors.otherReason ? "Este campo es obligatorio" : ""}
                />
            )}

            <Box mt={3}>
                <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
                    Registrar visita técnica
                </Button>
            </Box>
        </Container>
    );
};

export default NewVisitForm;