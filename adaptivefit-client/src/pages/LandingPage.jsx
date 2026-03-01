import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

export default function LandingPage() {
  return (
    <Container maxWidth="md" component="section" aria-label="Welcome">
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h2" gutterBottom>
          AdaptiveFit
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Your personalised adaptive fitness and nutrition platform
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="contained" size="large" component={RouterLink} to="/register">
            Get Started
          </Button>
          <Button variant="outlined" size="large" component={RouterLink} to="/login">
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
