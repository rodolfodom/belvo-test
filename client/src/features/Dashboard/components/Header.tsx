import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useAuth } from '../../auth/hooks/useAuth';
import { useNavigate } from 'react-router';

export function Header() {
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const { name, clearAuthData } = useAuth();
    const navigate = useNavigate();

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = () => {
        clearAuthData();
        navigate('/');
    };

    const initials = name
        ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <AppBar
            position="static"
            sx={{
                bgcolor: 'primary.main',
                boxShadow: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <AccountBalanceWalletIcon sx={{ color: 'primary.light', fontSize: 28 }} />
                        <Typography variant="h6" fontWeight={700} color="white" letterSpacing={0.5}>
                            Belvo
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {name && (
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                {name}
                            </Typography>
                        )}
                        <Tooltip title="Account settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar
                                    sx={{
                                        bgcolor: 'primary.light',
                                        color: 'primary.main',
                                        fontWeight: 700,
                                        width: 36,
                                        height: 36,
                                        fontSize: 14,
                                    }}
                                >
                                    {initials}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            anchorEl={anchorElUser}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            keepMounted
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            <MenuItem onClick={handleLogout}>
                                <Typography>Logout</Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
