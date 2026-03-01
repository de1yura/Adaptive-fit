import { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import toast from 'react-hot-toast';
import { submitCheckIn, getCheckInHistory, getCheckInDueStatus } from '../api/checkinApi';
import CheckInForm from '../components/checkin/CheckInForm';
import AdaptationAlert from '../components/checkin/AdaptationAlert';

export default function CheckInPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [due, setDue] = useState(false);
  const [history, setHistory] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [adaptation, setAdaptation] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [dueRes, historyRes] = await Promise.all([
        getCheckInDueStatus(),
        getCheckInHistory(),
      ]);
      setDue(dueRes.data.due);
      setHistory(historyRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load check-in data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const nextWeekNumber = history.length > 0
    ? Math.max(...history.map((c) => c.weekNumber)) + 1
    : 1;

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      const res = await submitCheckIn(payload);
      setAdaptation(res.data);
      setDialogOpen(true);
      toast.success('Check-in submitted!');
      const [dueRes, historyRes] = await Promise.all([
        getCheckInDueStatus(),
        getCheckInHistory(),
      ]);
      setDue(dueRes.data.due);
      setHistory(historyRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit check-in.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Skeleton variant="text" width={250} height={48} />
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, mt: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mt: 3 }} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>Weekly Check-In</Typography>
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Weekly Check-In</Typography>

        {due ? (
          <>
            <Alert severity="info" sx={{ mb: 3 }}>
              Your weekly check-in is due! Let us know how your training went.
            </Alert>
            <CheckInForm
              onSubmit={handleSubmit}
              submitting={submitting}
              weekNumber={nextWeekNumber}
            />
          </>
        ) : (
          <Alert severity="success" sx={{ mb: 3 }}>
            You're all caught up! Your next check-in isn't due yet.
          </Alert>
        )}

        <AdaptationAlert
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          adaptation={adaptation}
        />

        {history.length > 0 && (
          <Paper variant="outlined" sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ p: 2, pb: 0 }}>Check-In History</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Week</TableCell>
                    <TableCell>Sessions</TableCell>
                    <TableCell>Difficulty</TableCell>
                    <TableCell>Adapted</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((checkin) => (
                    <TableRow key={checkin.id}>
                      <TableCell>{checkin.weekNumber}</TableCell>
                      <TableCell>{checkin.sessionsCompleted}</TableCell>
                      <TableCell>{checkin.difficultyRating}/5</TableCell>
                      <TableCell>
                        {checkin.planVersionBefore !== checkin.planVersionAfter ? (
                          <Chip label="Yes" color="info" size="small" />
                        ) : (
                          <Chip label="No" size="small" variant="outlined" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </Container>
  );
}
