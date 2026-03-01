import { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import toast from 'react-hot-toast';
import { getWeeklySchedule } from '../api/workoutApi';
import WeeklyPlanView from '../components/workouts/WeeklyPlanView';

export default function WorkoutsPage() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await getWeeklySchedule();
        setSchedule(res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setSchedule(null);
        } else {
          const msg = err.response?.data?.message || 'Failed to load your workout plan.';
          setError(msg);
          toast.error(msg);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Skeleton variant="text" width={250} height={48} />
          <Skeleton variant="text" width={180} height={28} sx={{ mt: 1 }} />
          <Grid container spacing={3} sx={{ mt: 3 }}>
            {[1, 2, 3].map((i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
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
          <Typography variant="h4" gutterBottom>My Workouts</Typography>
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        </Box>
      </Container>
    );
  }

  if (!schedule || !schedule.days || schedule.days.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>My Workouts</Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            No active plan &mdash; complete onboarding first
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>My Workouts</Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
          <Chip label={`Version ${schedule.version}`} color="primary" variant="outlined" />
          <Chip label={`${schedule.daysPerWeek} days/week`} color="primary" variant="outlined" />
          <Chip
            label={`Week of ${schedule.weekStart}`}
            color="secondary"
            variant="outlined"
          />
        </Box>
        <WeeklyPlanView days={schedule.days} />
      </Box>
    </Container>
  );
}
