import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Switch, // 新增 Switch
  FormControlLabel, // 新增 FormControlLabel
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  ListAlt,
  Settings,
  ExitToApp,
  CalendarMonth as CalendarIcon, // Added CalendarIcon
  Brightness4 as Brightness4Icon, // 新增 Brightness4Icon (深色模式圖示)
  Brightness7 as Brightness7Icon, // 新增 Brightness7Icon (淺色模式圖示)
} from '@mui/icons-material';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { RootState } from '../store';
import { signOut as signOutAction } from '../store/slices/authSlice';
import { showSnackbar, toggleThemeMode, ThemeMode } from '../store/slices/uiSlice'; // 新增 toggleThemeMode 和 ThemeMode

const drawerWidth = 240;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const themeMode = useSelector((state: RootState) => state.ui.themeMode as ThemeMode); // 取得目前的主題模式

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      dispatch(signOutAction());
      dispatch(showSnackbar({
        message: '已成功登出',
        severity: 'success'
      }));
      navigate('/login');
    } catch (error) {
      dispatch(showSnackbar({
        message: '登出時發生錯誤',
        severity: 'error'
      }));
    }
  };

  const menuItems = [
    { text: '儀表板', icon: <Dashboard />, path: '/dashboard' },
    { text: '待辦事項', icon: <ListAlt />, path: '/todos' },
    { text: '日曆', icon: <CalendarIcon />, path: '/calendar' }, // Added Calendar menu item
    { text: '設定', icon: <Settings />, path: '/settings' },
  ];

  const drawer = (
    <Box>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            CloudSync Todo
          </Typography>
          {/* 主題切換開關 */}
          <FormControlLabel
            control={
              <Switch
                checked={themeMode === 'dark'}
                onChange={() => dispatch(toggleThemeMode())}
                icon={<Brightness7Icon />}
                checkedIcon={<Brightness4Icon />}
              />
            }
            label={themeMode === 'dark' ? <Brightness4Icon /> : <Brightness7Icon />}
            sx={{ mr: 1 }}
          />
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{ ml: 2 }}
          >
            <Avatar
              alt={user?.displayName || ''}
              src={user?.photoURL || ''}
              sx={{ width: 32, height: 32 }}
            />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
          >
            <MenuItem onClick={() => navigate('/settings')}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              設定
            </MenuItem>
            <MenuItem onClick={handleSignOut}>
              <ListItemIcon>
                <ExitToApp fontSize="small" />
              </ListItemIcon>
              登出
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
