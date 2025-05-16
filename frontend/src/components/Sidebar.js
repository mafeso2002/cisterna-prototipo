import React, { useState } from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  IconButton, Toolbar, Avatar, Typography, Divider
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import OpacityIcon from '@mui/icons-material/Opacity';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WaterIcon from '@mui/icons-material/WaterDrop';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SmartToyIcon from '@mui/icons-material/SmartToy'; // 👈 Ícono para Asistente IA

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const location = useLocation();

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const menuItems = [
    { text: 'Inicio', icon: <DashboardIcon />, path: '/' },
    { text: 'Mediciones', icon: <OpacityIcon />, path: '/mediciones' },
    { text: 'Configuración', icon: <SettingsIcon />, path: '/configuracion' },
    { text: 'Reporte', icon: <BarChartIcon />, path: '/reporte' },
    { text: 'Historial de Llenados', icon: <LocalShippingIcon />, path: '/historial-llenados' },
    { text: 'Ubicación', icon: <LocationOnIcon />, path: '/ubicacion' },
    { text: 'Cisternas', icon: <WaterIcon />, path: '/cisternas' },
    { text: 'Turnos', icon: <EventNoteIcon />, path: '/turnos' },
    { text: 'Asistente IA', icon: <SmartToyIcon />, path: '/asistente' } // ✅ NUEVA OPCIÓN
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 240 : 70,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: open ? 240 : 70,
          transition: 'width 0.3s',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          backgroundColor: '#1565c0',
          color: '#ffffff',
        },
      }}
    >
      <Toolbar sx={{ justifyContent: 'center' }}>
        <IconButton onClick={toggleDrawer} sx={{ color: '#ffffff' }}>
          <MenuIcon />
        </IconButton>
      </Toolbar>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

      <div style={{ textAlign: 'center', padding: '10px' }}>
        <Avatar
          alt="Usuario"
          src="https://i.pravatar.cc/150?img=3"
          sx={{
            width: 64,
            height: 64,
            margin: '0 auto',
            marginBottom: 1,
            border: '3px solid #4fc3f7',
          }}
        />
        {open && (
          <>
            <Typography variant="subtitle1" noWrap sx={{ color: '#ffffff' }}>
              Bienvenido
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: '#b3e5fc' }}>
              Usuario
            </Typography>
          </>
        )}
      </div>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

      <List>
        {menuItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                color: '#ffffff',
                '&.Mui-selected': {
                  backgroundColor: '#0288d1',
                  '&:hover': {
                    backgroundColor: '#039be5',
                  },
                },
                '&:hover': {
                  backgroundColor: '#0277bd',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: '#b3e5fc',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
