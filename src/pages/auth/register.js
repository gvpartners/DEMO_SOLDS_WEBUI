import React, { useState } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import authService from 'src/services/authService';
import { Box, Button, Link, Stack, TextField, Typography, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from 'src/hooks/use-auth';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';
import { API_BASE_URL, TOKEN } from 'src/config/config';

const Page = () => {
  const router = useRouter();
  const auth = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      name: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      submit: null,
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Debe ser un correo electrónico válido').max(255).required('El correo electrónico es obligatorio'),
      name: Yup.string().max(255).required('El nombre es obligatorio'),
      firstName: Yup.string().max(255).required('El apellido paterno es obligatorio'),
      lastName: Yup.string().max(255).required('El apellido materno es obligatorio'),
      password: Yup.string().max(255).required('La contraseña es obligatoria'),
      confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir').required('Debes confirmar tu contraseña'),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const formattedValues = {
          "Name": values.name,
          "Email": values.email,
          "Password": values.password,
          "FirstLastName": values.firstName,
          "SecondLastName": values.lastName,
          "Prefix": ""
        };
        const response = await authService.registerUser(formattedValues);
        if (response.ok) {
          Swal.fire({
            title: 'Registro exitoso',
            text: 'El registro fue realizado con éxito. Habla con el equipo para que te den acceso a la plataforma.',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(() => {
            router.push('/auth/login');
          });
        } else {
          Swal.fire({
            title: 'Error al registrar',
            text: 'El correo ya se encuentra registrado.',
            icon: 'warning',
            confirmButtonText: 'OK'
          });
        }
      } catch (err) {
        toast.error('Registro inválido');
        helpers.setStatus({ success: false });
        helpers.setSubmitting(false);
      }
    },
  });

  const handlePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <>
      <Head>
        <title>Registrarse</title>
      </Head>
      <Box
        sx={{
          flex: '1 1 auto',
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            maxWidth: 550,
            px: 3,
            py: '100px',
            width: '100%',
          }}
        >
          <div>
            <Stack spacing={1} sx={{ mb: 3 }}>
              <Typography variant="h4">Registrarse</Typography>
              <Typography color="text.secondary" variant="body2">
                ¿Ya tienes una cuenta?
                &nbsp;
                <Link component={NextLink} href="/auth/login" underline="hover" variant="subtitle2">
                  Iniciar sesión
                </Link>
              </Typography>
            </Stack>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  error={!!(formik.touched.name && formik.errors.name)}
                  fullWidth
                  helperText={formik.touched.name && formik.errors.name}
                  label="Nombre"
                  name="name"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.name}
                />
                <TextField
                  error={!!(formik.touched.firstName && formik.errors.firstName)}
                  fullWidth
                  helperText={formik.touched.firstName && formik.errors.firstName}
                  label="Apellido Paterno"
                  name="firstName"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.firstName}
                />
                <TextField
                  error={!!(formik.touched.lastName && formik.errors.lastName)}
                  fullWidth
                  helperText={formik.touched.lastName && formik.errors.lastName}
                  label="Apellido Materno"
                  name="lastName"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.lastName}
                />
                <TextField
                  error={!!(formik.touched.email && formik.errors.email)}
                  fullWidth
                  helperText={formik.touched.email && formik.errors.email}
                  label="Correo Electrónico"
                  name="email"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="email"
                  value={formik.values.email}
                />
                <TextField
                  error={!!(formik.touched.password && formik.errors.password)}
                  fullWidth
                  helperText={formik.touched.password && formik.errors.password}
                  label="Contraseña"
                  name="password"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.password}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={handlePasswordVisibility}>
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    ),
                  }}
                />
                <TextField
                  error={!!(formik.touched.confirmPassword && formik.errors.confirmPassword)}
                  fullWidth
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                  label="Confirmar Contraseña"
                  name="confirmPassword"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={handlePasswordVisibility}>
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    ),
                  }}
                />
              </Stack>
              {formik.errors.submit && (
                <Typography color="error" sx={{ mt: 3 }} variant="body2">
                  {formik.errors.submit}
                </Typography>
              )}
              <Button
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                type="submit"
                variant="contained"
                disabled={!formik.isValid}
              >
                Continuar
              </Button>
            </form>
          </div>
        </Box>
      </Box>
      <ToastContainer />
    </>
  );
};

Page.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default Page;
