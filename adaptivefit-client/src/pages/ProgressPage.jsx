import { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import toast from 'react-hot-toast';
import { getProgressData, getPlanHistory } from '../api/progressApi';
import WeightChart from '../components/progress/WeightChart';
import AdherenceChart from '../components/progress/AdherenceChart';
import PlanHistoryTimeline from '../components/progress/PlanHistoryTimeline';

export default function ProgressPage() {
  const [progress, setProgress] = useState(null);
  const [planHistory, setPlanHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, historyRes] = await Promise.all([
          getProgressData(),
          getPlanHistory(),
        ]);
        setProgress(progressRes.data);
        setPlanHistory(historyRes.data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load progress data.';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" component="section" aria-label="Progress">
        <Box sx={{ mt: 4 }}>
          <Skeleton variant="text" width={200} height={48} />
          <Skeleton variant="rectangular" height={48} sx={{ mt: 2, borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={300} sx={{ mt: 3, borderRadius: 2 }} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" component="section" aria-label="Progress">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>Progress</Typography>
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        </Box>
      </Container>
    );
  }

  const hasNoData =
    (!progress?.weightTrend || progress.weightTrend.length === 0) &&
    (!progress?.weeklyAdherence || progress.weeklyAdherence.length === 0) &&
    (!planHistory || planHistory.length === 0);

  if (hasNoData) {
    return (
      <Container maxWidth="lg" component="section" aria-label="Progress">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>Progress</Typography>
          <Alert severity="info" sx={{ mt: 2 }}>No progress data yet</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" component="section" aria-label="Progress">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Progress</Typography>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Weight" />
          <Tab label="Adherence" />
          <Tab label="Plan History" />
        </Tabs>

        <Box sx={{ py: 2 }}>
          {tab === 0 && <WeightChart data={progress?.weightTrend} />}
          {tab === 1 && <AdherenceChart data={progress?.weeklyAdherence} />}
          {tab === 2 && (
            <PlanHistoryTimeline
              data={
                planHistory?.map((p) => ({
                  version: p.version,
                  date: p.createdAt,
                  changeSummary: p.changeSummary,
                })) || progress?.planHistory
              }
            />
          )}
        </Box>
      </Box>
    </Container>
  );
}
