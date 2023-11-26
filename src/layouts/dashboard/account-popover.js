import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { Box, Divider, MenuItem, MenuList, Popover, Typography } from '@mui/material';
import { useAuth } from 'src/hooks/use-auth';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { padding } from '@mui/system';

export const AccountPopover = (props) => {
  const { anchorEl, onClose, open } = props;
  const router = useRouter();
  const auth = useAuth();

  const handleSignOut = useCallback(
    () => {
      onClose?.();
      auth.signOut();
      sessionStorage.clear();
      router.push('/auth/login');
    },
    [onClose, auth, router]
  );

  const handleViewProfile = () => {
    onClose?.();
    router.push('/account')
  }

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'left',
        vertical: 'bottom'
      }}
      onClose={onClose}
      open={open}
      PaperProps={{ sx: { width: 200 } }}
    >
      <Box
        sx={{
          py: 1.5,
          px: 2
        }}
      >
        <Typography variant="overline">
          Cuenta
        </Typography>
        <Typography
          color="text.secondary"
          variant="body2"
        >
          {sessionStorage.getItem('user')}
        </Typography>
      </Box>
      <Divider />
      <MenuList
        disablePadding
        dense
        sx={{
          p: '8px',
          '& > *': {
            borderRadius: 1
          }
        }}
      >
        <MenuItem onClick={handleViewProfile} style={{ padding: '8px', display: 'flex', alignItems: 'center' }}>
          <VisibilityIcon style={{ marginRight: '8px' }} />
          Ver Perfil
        </MenuItem>
        <MenuItem onClick={handleSignOut} style={{ padding: '8px', display: 'flex', alignItems: 'center' }}>
          <ExitToAppIcon style={{ marginRight: '8px' }} />
          Cerrar sesión
        </MenuItem>
      </MenuList>
    </Popover>
  );
};

AccountPopover.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired
};
