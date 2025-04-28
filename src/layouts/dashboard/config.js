import ChartBarIcon from '@heroicons/react/24/solid/ChartBarIcon';
import CogIcon from '@heroicons/react/24/solid/CogIcon';
import LockClosedIcon from '@heroicons/react/24/solid/LockClosedIcon';
import ShoppingBagIcon from '@heroicons/react/24/solid/ShoppingBagIcon';
import UserIcon from '@heroicons/react/24/solid/UserIcon';
import UserPlusIcon from '@heroicons/react/24/solid/UserPlusIcon';
import UsersIcon from '@heroicons/react/24/solid/UsersIcon';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedInTwoTone';
import ContentPasteOffIcon from '@mui/icons-material/ContentPasteOff';
import CloudUpload from '@mui/icons-material/CloudUpload';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import { SvgIcon } from '@mui/material';

export const items = [
  {
    title: 'Resumen',
    path: '/',
    icon: (
      <SvgIcon fontSize="small">
        <ChartBarIcon />
      </SvgIcon>
    )
  },
  {
    title: 'Cotizaciones',
    path: '/invoices',
    icon: (
      <SvgIcon fontSize="small">
        <AssignmentIcon />
      </SvgIcon>
    )
  },
  {
    title: 'Link - Recojo en Planta',
    path: 'https://forms.gle/NYAa1sYyQSdSLyfR7',
    external: true,
    icon: (
      <SvgIcon fontSize="small">
        <AssignmentTurnedInIcon />
      </SvgIcon>
    )
  },
  {
    title: 'Visitas técnicas',
    path: '/visits',
    icon: (
      <SvgIcon fontSize="small">
        <ContentPasteOffIcon />
      </SvgIcon>
    )
  },
  {
    title: 'Clientes',
    path: '/customers',
    icon: (
      <SvgIcon fontSize="small">
        <AddBusinessIcon />
      </SvgIcon>
    )
  },
  {
    title: 'Usuarios',
    path: '/users',
    icon: (
      <SvgIcon fontSize="small">
        <UsersIcon />
      </SvgIcon>
    )
  },
  {
    title: 'Solicitudes de clientes',
    path: '/requests',
    icon: (
      <SvgIcon fontSize="small">
        <CloudUpload />
      </SvgIcon>
    )
  }
];