import { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import toast from 'react-hot-toast';
import { getTargets, logNutrition, getHistory } from '../api/nutritionApi';
import NutritionDashboard from '../components/nutrition/NutritionDashboard';
import NutritionLogForm from '../components/nutrition/NutritionLogForm';

export default function NutritionPage() {
  const [targets, setTargets] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [targetsRes, historyRes] = await Promise.all([
        getTargets(),
        getHistory(),
      ]);
      setTargets(targetsRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load nutrition data.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = history.find((log) => log.logDate === todayStr) || null;

  const handleLogSubmit = async (payload) => {
    setSubmitting(true);
    try {
      await logNutrition(payload);
      toast.success('Nutrition logged successfully!');
      const historyRes = await getHistory();
      setHistory(historyRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log nutrition.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" component="section" aria-label="Nutrition">
        <Box sx={{ mt: 4 }}>
          <Skeleton variant="text" width={200} height={48} />
          <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2, mt: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mt: 3 }} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" component="section" aria-label="Nutrition">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>Nutrition</Typography>
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" component="section" aria-label="Nutrition">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Nutrition</Typography>

        {targets ? (
          <NutritionDashboard targets={targets} todayLog={todayLog} />
        ) : (
          <Alert severity="info" sx={{ mb: 3 }}>No nutrition plan found</Alert>
        )}

        <NutritionLogForm onSubmit={handleLogSubmit} submitting={submitting} />

        {targets?.dietaryTips?.length > 0 && (
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Dietary Tips</Typography>
            <List dense>
              {targets.dietaryTips.map((tip, idx) => (
                <ListItem key={idx}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <TipsAndUpdatesIcon color="warning" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={tip} />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </Container>
  );
}
