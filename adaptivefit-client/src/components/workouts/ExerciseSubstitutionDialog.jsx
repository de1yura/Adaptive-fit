import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { getAlternativeExercises } from '../../api/workoutApi';

export default function ExerciseSubstitutionDialog({ open, onClose, exercise, onConfirm }) {
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!open || !exercise) return;
    setSelected(null);
    setError(null);
    setLoading(true);

    getAlternativeExercises(exercise.exerciseId)
      .then((res) => setAlternatives(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load alternatives.'))
      .finally(() => setLoading(false));
  }, [open, exercise]);

  const handleConfirm = async () => {
    if (!selected) return;
    setConfirming(true);
    try {
      await onConfirm(exercise.exerciseId, selected.id);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Substitute Exercise</DialogTitle>
      <DialogContent dividers>
        {exercise && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Replace <strong>{exercise.exerciseName}</strong> with:
          </Typography>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && alternatives.length === 0 && (
          <Alert severity="info">No alternative exercises available.</Alert>
        )}

        {!loading && !error && alternatives.length > 0 && (
          <List disablePadding>
            {alternatives.map((alt) => (
              <ListItemButton
                key={alt.id}
                selected={selected?.id === alt.id}
                onClick={() => setSelected(alt)}
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                <ListItemText
                  primary={alt.name}
                  secondary={alt.description}
                />
                <Box sx={{ display: 'flex', gap: 0.5, ml: 1, flexShrink: 0 }}>
                  <Chip label={alt.difficulty} size="small" variant="outlined" />
                  <Chip label={alt.equipmentRequired} size="small" />
                </Box>
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!selected || confirming}
        >
          {confirming ? 'Substituting...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
