import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import useAuth from '../../hooks/useAuth';

const authLinks = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Workouts', to: '/workouts' },
  { label: 'Nutrition', to: '/nutrition' },
  { label: 'Progress', to: '/progress' },
  { label: 'Settings', to: '/settings' },
];

const guestLinks = [
  { label: 'Login', to: '/login' },
  { label: 'Register', to: '/register' },
];

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDrawerOpen(false);
  };

  const links = isAuthenticated ? authLinks : guestLinks;

  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <Typography variant="h6" sx={{ p: 2 }}>
        AdaptiveFit
      </Typography>
      <Divider />
      <List component="nav" aria-label="Main navigation">
        {links.map((link) => (
          <ListItem key={link.to} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={link.to}
              onClick={() => setDrawerOpen(false)}
            >
              <ListItemText primary={link.label} />
            </ListItemButton>
          </ListItem>
        ))}
        {isAuthenticated && (
          <>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="static" component="nav">
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="Open navigation menu"
          edge="start"
          onClick={() => setDrawerOpen(true)}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
        >
          AdaptiveFit
        </Typography>

        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
          {links.map((link) => (
            <Button key={link.to} color="inherit" component={RouterLink} to={link.to}>
              {link.label}
            </Button>
          ))}
          {isAuthenticated && (
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          )}
        </Box>
      </Toolbar>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { sm: 'none' } }}
      >
        {drawerContent}
      </Drawer>
    </AppBar>
  );
}
