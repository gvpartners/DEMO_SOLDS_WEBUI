import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton 
} from '@mui/material';
import Swal from 'sweetalert2';
import userService from 'src/services/userService';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Page = () => {
  const [values, setValues] = useState({
    name: '',
    firstLastName: '',
    secondLastName: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const updateUserById = async () => {
    try {
      const { name, firstLastName, secondLastName, phone } = values;

      if (!name || !firstLastName || !secondLastName || phone.length !== 9) {
        Swal.fire({
          title: 'Error en la actualización',
          text: 'Por favor, complete todos los campos requeridos.',
          icon: 'warning',
        });
        return;
      }

      const response = await userService.updateUserById(values);

      if (response.status === 200) {
        Swal.fire({
          title: 'Actualización de usuario',
          text: 'El usuario se ha actualizado con éxito.',
          icon: 'success',
        });
        getUserById();
        sessionStorage.setItem('user', `${name} ${firstLastName}`);
      } else {
        Swal.fire({
          title: 'Error en la actualización',
          text: 'No se pudo actualizar al usuario.',
          icon: 'error',
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const updatePasswordById = async () => {
    try {
      const { password, confirm } = values;

      if (!password || !confirm || confirm !== password) {
        Swal.fire({
          title: 'Error en la actualización',
          text: 'Ambas contraseñas deben coincidir.',
          icon: 'warning',
        });
      } else {
        const response = await userService.updatePasswordById(values.id, password);

        if (response.status === 200) {
          Swal.fire({
            title: 'Actualización de contraseña',
            text: 'La contraseña se ha actualizado con éxito.',
            icon: 'success',
          }).then(() => {
            window.location.href = '/auth/login';
          });
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const getUserById = async () => {
    try {
      const response = await userService.getUserById(sessionStorage.getItem('identificator'));
      if (response.status === 200) {
        const fetchedData = response.data;
        setValues((prevValues) => ({
          ...prevValues,
          ...fetchedData,
        }));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    getUserById();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    updateUserById();
  };

  const handleUpdatePassword = (event) => {
    event.preventDefault();
    updatePasswordById();
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <>
      <Head>
        <title>Perfil</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Typography variant="h4">Perfil</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={4}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        alignItems: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Avatar
                        src="/assets/avatars/unicon.png"
                        sx={{ height: 80, mb: 2, width: 80 }}
                      />
                      <Typography gutterBottom variant="h5">
                        {`${values.name} ${values.firstLastName}`}
                      </Typography>
                      <Typography color="textSecondary" variant="body2">
                        Lima, Perú
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
                <form onSubmit={handleUpdatePassword} style={{ paddingTop: '20px' }}>
                  <Card>
                    <CardHeader
                      subheader="Actualizar contraseña"
                      title="Contraseña"
                    />
                    <div style={{ paddingTop: '5px', paddingLeft: '20px', paddingRight: '20px' }}>
                      <TextField
                        fullWidth
                        label="Contraseña"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        style={{ paddingBottom: '12px' }}
                        onChange={handleInputChange}
                        value={values.password}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={handleTogglePasswordVisibility}
                                edge="end"
                              >
                                {showPassword ? <Visibility /> : <VisibilityOff />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Contraseña (Confirmar)"
                        name="confirm"
                        type={showPassword ? 'text' : 'password'}
                        disabled={!values.password}
                        onChange={handleInputChange}
                        style={{ paddingBottom: '12px' }}
                        value={values.confirm}
                        
                      />
                    </div>
                    <Divider />
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                      <Button variant="contained" type="submit">
                        Actualizar
                      </Button>
                    </CardActions>
                  </Card>
                </form>
              </Grid>
              <Grid item xs={12} md={6} lg={8}>
                <form autoComplete="off" noValidate onSubmit={handleSubmit}>
                  <Card>
                    <div style={{ paddingTop: '20px', paddingLeft: '25px' }}>
                      <Typography variant="h6">Cuenta</Typography>
                      <Typography variant="body2">Información del perfil</Typography>
                    </div>

                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Nombre"
                            name="name"
                            required
                            value={values.name}
                            onChange={handleInputChange}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Apellido Paterno"
                            name="firstLastName"
                            value={values.firstLastName}
                            required
                            onChange={handleInputChange}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Apellido Materno"
                            name="secondLastName"
                            value={values.secondLastName}
                            onChange={handleInputChange}
                            required
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="E-mail"
                            type="email"
                            name="email"
                            value={values.email}
                            disabled
                            onChange={handleInputChange}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Número de celular"
                            type="number"
                            name="phone"
                            value={values.phone}
                            onChange={handleInputChange}
                            required
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                      <Button variant="contained" type="submit">
                        Actualizar
                      </Button>
                    </CardActions>
                  </Card>
                </form>
              </Grid>
            </Grid>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
