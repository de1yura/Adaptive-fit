import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { getDashboard } from '../api/progressApi';

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDashboard();
        setDashboard(res.data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load dashboard data.';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const isCheckInDue = () => {
    if (!dashboard?.nextCheckInDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(dashboard.nextCheckInDate + 'T00:00:00');
    return checkInDate <= today;
  };

  const formatCheckInDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Skeleton variant="text" width={300} height={48} />
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {[1, 2, 3, 4].map((i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={3} sx={{ mt: 3 }}>
            {[1, 2].map((i) => (
              <Grid size={{ xs: 12, sm: 6 }} key={i}>
                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
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

        {isCheckInDue() && (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
            action={
              <Chip
                label="Go to Check-In"
                component={RouterLink}
                to="/checkin"
                clickable
                color="warning"
                size="small"
              />
            }
          >
            <AlertTitle>Check-In Due</AlertTitle>
            Your weekly check-in is due! Submit it to keep your plan optimised.
          </Alert>
        )}

        <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
          Summary
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <FitnessCenterIcon color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    Workouts This Week
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {dashboard?.workoutsThisWeek ?? 0}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={dashboard?.workoutsThisWeek && dashboard?.currentPlanVersion > 0
                    ? Math.min(100, (dashboard.workoutsThisWeek / 7) * 100)
                    : 0}
                  sx={{ mt: 1, borderRadius: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AssessmentIcon color="secondary" />
                  <Typography variant="body2" color="text.secondary">
                    Adherence
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {dashboard?.adherencePercentage ?? 0}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={dashboard?.adherencePercentage ?? 0}
                  color="secondary"
                  sx={{ mt: 1, borderRadius: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="body2" color="text.secondary">
                    Plan Version
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {dashboard?.currentPlanVersion ?? 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AssessmentIcon color="info" />
                  <Typography variant="body2" color="text.secondary">
                    Next Check-In
                  </Typography>
                </Box>
                {isCheckInDue() ? (
                  <Chip label="Due Now" color="warning" size="medium" sx={{ mt: 0.5, fontWeight: 'bold' }} />
                ) : (
                  <Typography variant="h6" fontWeight="bold">
                    {formatCheckInDate(dashboard?.nextCheckInDate)}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" color="text.secondary" gutterBottom>
          Quick Links
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card variant="outlined">
              <CardActionArea component={RouterLink} to="/workouts">
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FitnessCenterIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6">Today&apos;s Workout</Typography>
                    <Typography variant="body2" color="text.secondary">
                      View and log your workout for today
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card variant="outlined">
              <CardActionArea component={RouterLink} to="/nutrition">
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <RestaurantIcon color="secondary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6">Log Nutrition</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Track your daily calories and macros
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
