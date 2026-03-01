import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/auth/register', {
        email: form.email,
        password: form.password,
      });
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/login');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
              Create Account
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
              Sign up to get your personalised fitness plan
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                margin="normal"
                required
                autoComplete="email"
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                margin="normal"
                required
                autoComplete="new-password"
              />
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                margin="normal"
                required
                autoComplete="new-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
              </Button>
              <Typography variant="body2" align="center">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login">
                  Login
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
