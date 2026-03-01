import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function ExerciseLogForm({ log, onChange }) {
  const handleChange = (field) => (e) => {
    onChange({ ...log, [field]: e.target.value });
  };

  return (
    <Box sx={{ display: 'flex', gap: 1.5, mt: 1, flexWrap: 'wrap' }}>
      <TextField
        label="Actual Sets"
        type="number"
        size="small"
        value={log.actualSets}
        onChange={handleChange('actualSets')}
        sx={{ width: 120 }}
        inputProps={{ min: 0 }}
      />
      <TextField
        label="Actual Reps"
        size="small"
        value={log.actualReps}
        onChange={handleChange('actualReps')}
        sx={{ width: 120 }}
      />
      <TextField
        label="Weight (kg)"
        type="number"
        size="small"
        value={log.actualWeightKg}
        onChange={handleChange('actualWeightKg')}
        sx={{ width: 120 }}
        inputProps={{ min: 0, step: 0.5 }}
      />
    </Box>
  );
}
