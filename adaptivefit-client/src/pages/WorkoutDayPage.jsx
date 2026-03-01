import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import toast from 'react-hot-toast';
import { getDayDetail, completeWorkout, substituteExercise } from '../api/workoutApi';
import ExerciseRow from '../components/workouts/ExerciseRow';
import ExerciseSubstitutionDialog from '../components/workouts/ExerciseSubstitutionDialog';

export default function WorkoutDayPage() {
  const { dayId } = useParams();
  const navigate = useNavigate();
  const [day, setDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [logs, setLogs] = useState({});
  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [subExercise, setSubExercise] = useState(null);

  useEffect(() => {
    const fetchDay = async () => {
      try {
        const res = await getDayDetail(dayId);
        setDay(res.data);
        if (res.data.completed) {
          setCompleted(true);
        }
        const initialLogs = {};
        (res.data.exercises || []).forEach((ex) => {
          initialLogs[ex.exerciseId] = { actualSets: '', actualReps: '', actualWeightKg: '' };
        });
        setLogs(initialLogs);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load workout day.';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchDay();
  }, [dayId]);

  const handleLogChange = (exerciseId) => (updatedLog) => {
    setLogs((prev) => ({ ...prev, [exerciseId]: updatedLog }));
  };

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const exerciseLogs = Object.entries(logs)
        .filter(([, log]) => log.actualSets || log.actualReps || log.actualWeightKg)
        .map(([exerciseId, log]) => ({
          exerciseId: Number(exerciseId),
          actualSets: log.actualSets ? Number(log.actualSets) : null,
          actualReps: log.actualReps || null,
          actualWeightKg: log.actualWeightKg ? Number(log.actualWeightKg) : null,
        }));

      await completeWorkout({ dayId: Number(dayId), exerciseLogs });
      setCompleted(true);
      toast.success('Workout completed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete workout.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenSubstitute = (exercise) => {
    setSubExercise(exercise);
    setSubDialogOpen(true);
  };

  const handleCloseSubstitute = () => {
    setSubDialogOpen(false);
    setSubExercise(null);
  };

  const handleConfirmSubstitute = async (exerciseId, newExerciseId) => {
    try {
      const res = await substituteExercise({ exerciseId, newExerciseId });
      setDay((prev) => ({
        ...prev,
        exercises: prev.exercises.map((ex) =>
          ex.exerciseId === exerciseId
            ? { ...ex, exerciseName: res.data.newExercise }
            : ex
        ),
      }));
      toast.success(`Substituted with ${res.data.newExercise}`);
      handleCloseSubstitute();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to substitute exercise.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" component="section" aria-label="Workout day">
        <Box sx={{ mt: 4 }}>
          <Skeleton variant="text" width={300} height={48} />
          <Skeleton variant="text" width={180} height={28} sx={{ mt: 1 }} />
          <Skeleton variant="rectangular" height={300} sx={{ mt: 3, borderRadius: 2 }} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" component="section" aria-label="Workout day">
        <Box sx={{ mt: 4 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/workouts')} sx={{ mb: 2 }}>
            Back to Workouts
          </Button>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" component="section" aria-label="Workout day">
      <Box sx={{ mt: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/workouts')} sx={{ mb: 2 }}>
          Back to Workouts
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="h4">{day.dayLabel}</Typography>
          {completed && (
            <Chip icon={<CheckCircleIcon />} label="Completed" color="success" />
          )}
        </Box>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {day.focusArea}
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Exercise</TableCell>
                <TableCell align="center">Sets</TableCell>
                <TableCell align="center">Reps</TableCell>
                <TableCell align="center">Rest</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(day.exercises || []).map((exercise) => (
                <ExerciseRow
                  key={exercise.exerciseId}
                  exercise={exercise}
                  log={logs[exercise.exerciseId] || { actualSets: '', actualReps: '', actualWeightKg: '' }}
                  onLogChange={handleLogChange(exercise.exerciseId)}
                  disabled={completed}
                  onSubstitute={handleOpenSubstitute}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {!completed && (
          <Box sx={{ mt: 3, mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleComplete}
              disabled={submitting}
            >
              {submitting ? 'Completing...' : 'Mark Complete'}
            </Button>
          </Box>
        )}

        <ExerciseSubstitutionDialog
          open={subDialogOpen}
          onClose={handleCloseSubstitute}
          exercise={subExercise}
          onConfirm={handleConfirmSubstitute}
        />
      </Box>
    </Container>
  );
}
