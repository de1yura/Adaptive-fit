import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';

const difficultyMarks = [
  { value: 1, label: 'Too Easy' },
  { value: 2, label: 'Easy' },
  { value: 3, label: 'Just Right' },
  { value: 4, label: 'Hard' },
  { value: 5, label: 'Too Hard' },
];

export default function CheckInForm({ onSubmit, submitting, weekNumber }) {
  const [sessionsCompleted, setSessionsCompleted] = useState('');
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [currentWeightKg, setCurrentWeightKg] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (sessionsCompleted === '') {
      newErrors.sessionsCompleted = 'Sessions completed is required';
    } else if (Number(sessionsCompleted) < 0) {
      newErrors.sessionsCompleted = 'Must be 0 or greater';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      weekNumber,
      sessionsCompleted: parseInt(sessionsCompleted, 10),
      difficultyRating,
    };
    if (currentWeightKg) {
      payload.currentWeightKg = parseFloat(currentWeightKg);
    }
    if (notes.trim()) {
      payload.notes = notes.trim();
    }
    onSubmit(payload);
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Week {weekNumber} Check-In</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          label="Sessions Completed"
          type="number"
          required
          value={sessionsCompleted}
          onChange={(e) => {
            setSessionsCompleted(e.target.value);
            if (errors.sessionsCompleted) setErrors((prev) => ({ ...prev, sessionsCompleted: '' }));
          }}
          error={!!errors.sessionsCompleted}
          helperText={errors.sessionsCompleted}
          inputProps={{ min: 0 }}
          fullWidth
        />

        <Box>
          <Typography gutterBottom>Difficulty Rating</Typography>
          <Slider
            value={difficultyRating}
            onChange={(e, val) => setDifficultyRating(val)}
            min={1}
            max={5}
            step={1}
            marks={difficultyMarks}
            valueLabelDisplay="off"
          />
        </Box>

        <TextField
          label="Current Weight (kg)"
          type="number"
          value={currentWeightKg}
          onChange={(e) => setCurrentWeightKg(e.target.value)}
          inputProps={{ min: 0, step: '0.1' }}
          fullWidth
          helperText="Optional"
        />

        <TextField
          label="Notes"
          multiline
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          fullWidth
          helperText="Optional"
        />

        <Button
          type="submit"
          variant="contained"
          disabled={submitting || sessionsCompleted === ''}
          sx={{ alignSelf: 'flex-start' }}
        >
          {submitting ? <CircularProgress size={24} /> : 'Submit Check-In'}
        </Button>
      </Box>
    </Paper>
  );
}
