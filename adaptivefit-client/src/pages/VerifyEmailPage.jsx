import { useState, useEffect } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    api.get(`/auth/verify?token=${encodeURIComponent(token)}`)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        toast.success('Email verified!');
      })
      .catch((err) => {
        setStatus('error');
        const msg = err.response?.data?.message || 'Verification failed. The token may be invalid or expired.';
        setMessage(msg);
        toast.error(msg);
      });
  }, [searchParams]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Email Verification
            </Typography>

            {status === 'loading' && (
              <Box sx={{ my: 4 }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Verifying your email...
                </Typography>
              </Box>
            )}

            {status === 'success' && (
              <Box sx={{ my: 4 }}>
                <CheckCircleOutlineIcon color="success" sx={{ fontSize: 64 }} />
                <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
                  {message}
                </Typography>
                <Link component={RouterLink} to="/login" variant="body1">
                  Go to Login
                </Link>
              </Box>
            )}

            {status === 'error' && (
              <Box sx={{ my: 4 }}>
                <ErrorOutlineIcon color="error" sx={{ fontSize: 64 }} />
                <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
                  {message}
                </Typography>
                <Link component={RouterLink} to="/login" variant="body1">
                  Go to Login
                </Link>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
