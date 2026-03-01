import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import EventNoteIcon from '@mui/icons-material/EventNote';
import useAuth from '../hooks/useAuth';
import api from '../api/axiosConfig';

export default function DashboardPage() {
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await api.get('/api/plans/current');
        setPlan(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your workout plan.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Skeleton variant="text" width={300} height={48} />
          <Skeleton variant="text" width={200} height={28} sx={{ mt: 1 }} />
          <Grid container spacing={3} sx={{ mt: 3 }}>
            {[1, 2, 3].map((i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={2} sx={{ mt: 4 }}>
            {[1, 2, 3].map((i) => (
              <Grid size={{ xs: 12, sm: 4 }} key={i}>
                <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>Dashboard</Typography>
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.sub || 'User'}!
        </Typography>

        {plan && (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Plan Summary
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Chip label={`Version ${plan.version}`} color="primary" variant="outlined" />
                <Chip label={`${plan.daysPerWeek} days/week`} color="primary" variant="outlined" />
                <Chip label={plan.intensityLevel?.replace(/_/g, ' ')} color="secondary" variant="outlined" />
              </Box>
            </Box>

            <Typography variant="h6" color="text.secondary" gutterBottom>
              Workout Days
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {plan.days
                ?.slice()
                .sort((a, b) => a.dayNumber - b.dayNumber)
                .map((day) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={day.id}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {day.dayLabel}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {day.focusArea}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {day.exercises?.length || 0} exercises
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </>
        )}

        <Typography variant="h6" color="text.secondary" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              component={RouterLink}
              to="/workouts"
              variant="contained"
              fullWidth
              startIcon={<FitnessCenterIcon />}
              sx={{ py: 1.5 }}
            >
              View Workouts
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              component={RouterLink}
              to="/nutrition"
              variant="contained"
              fullWidth
              startIcon={<RestaurantIcon />}
              sx={{ py: 1.5 }}
            >
              Log Nutrition
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              component={RouterLink}
              to="/checkin"
              variant="contained"
              fullWidth
              startIcon={<EventNoteIcon />}
              sx={{ py: 1.5 }}
            >
              Weekly Check-In
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
