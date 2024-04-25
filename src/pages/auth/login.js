import { useEffect, useCallback, useState } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Alert,
  Box,
  Button,
  FormHelperText,
  Link,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useAuth } from 'src/hooks/use-auth';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import authService from 'src/services/authService';

const Page = () => {
  const router = useRouter();
  const auth = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('authToken', '');
    sessionStorage.setItem('authenticated', false);
    sessionStorage.setItem('userEmail', '');
    sessionStorage.setItem('user', '')
  }, []);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Debe ser un correo electrónico válido')
        .max(255)
        .required('El correo electrónico es obligatorio'),
      password: Yup.string().max(255).required('La contraseña es obligatoria'),
    }),

  });
  const handleLogin = async (values, helpers) => {
    try {
      // Call the loginUser function from authService
      const res = await authService.loginUser(values, formik.values.email);
      if (res.ok) {
        auth.skip();
        router.push('/');
      }
      else if (res.status == 401) {
        helpers.setStatus({ success: false });
        helpers.setSubmitting(false);
        toast.error('No cuenta con acceso a la plataforma.');
      }
      else {
        helpers.setStatus({ success: false });
        helpers.setSubmitting(false);
        toast.error('Credenciales incorrectas');
      }
    } catch (err) {
      toast.error('Plataforma en mantenimiento');
      helpers.setStatus({ success: false });
      helpers.setSubmitting(false);

    }
  };

  const handleSkip = useCallback(() => {
    auth.skip();
    router.push('/');
  }, [auth, router]);

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <>
      <Head>
        <title>Iniciar sesión</title>
        <link rel="icon" href="/assets/avatars/unicon.png" lazy />
      </Head>

      <Box
        sx={{
          backgroundColor: 'background.paper',
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
              <Typography variant="h4">Iniciar sesión</Typography>
              <Typography color="text.secondary" variant="body2">
                ¿No tienes una cuenta?
                &nbsp;
                <Link
                  component={NextLink}
                  href="/auth/register"
                  underline="hover"
                  variant="subtitle2"
                >
                  Registrarse
                </Link>
              </Typography>
            </Stack>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  error={!!(formik.touched.email && formik.errors.email)}
                  fullWidth
                  helperText={formik.touched.email && formik.errors.email}
                  label="Dirección de correo electrónico"
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
              </Stack>
              {/* <FormHelperText sx={{ mt: 1 }}>
                Opcionalmente puedes omitir este paso.
              </FormHelperText> */}
              {formik.errors.submit && (
                <Typography color="error" sx={{ mt: 3 }} variant="body2">
                  {formik.errors.submit}
                </Typography>
              )}
              <Button
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                variant="contained"
                onClick={() => handleLogin(formik.values, formik)}
              >
                Continuar
              </Button>
              {/* <Button fullWidth size="large" sx={{ mt: 3 }} onClick={handleSkip}>
                Skip authentication
              </Button> */}
            </form>
          </div>
        </Box>
      </Box>
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
};

Page.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default Page;
