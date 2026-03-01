import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

export default function NutritionLogForm({ onSubmit, submitting }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    logDate: today,
    caloriesConsumed: '',
    proteinG: '',
    carbsG: '',
    fatsG: '',
  });

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      logDate: form.logDate,
      caloriesConsumed: form.caloriesConsumed ? Number(form.caloriesConsumed) : null,
      proteinG: form.proteinG ? Number(form.proteinG) : null,
      carbsG: form.carbsG ? Number(form.carbsG) : null,
      fatsG: form.fatsG ? Number(form.fatsG) : null,
    });
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Log Nutrition</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              value={form.logDate}
              onChange={handleChange('logDate')}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Calories"
              type="number"
              fullWidth
              value={form.caloriesConsumed}
              onChange={handleChange('caloriesConsumed')}
              slotProps={{ input: { inputProps: { min: 0 } } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label="Protein (g)"
              type="number"
              fullWidth
              value={form.proteinG}
              onChange={handleChange('proteinG')}
              slotProps={{ input: { inputProps: { min: 0, step: 0.1 } } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label="Carbs (g)"
              type="number"
              fullWidth
              value={form.carbsG}
              onChange={handleChange('carbsG')}
              slotProps={{ input: { inputProps: { min: 0, step: 0.1 } } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label="Fats (g)"
              type="number"
              fullWidth
              value={form.fatsG}
              onChange={handleChange('fatsG')}
              slotProps={{ input: { inputProps: { min: 0, step: 0.1 } } }}
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          sx={{ mt: 2 }}
        >
          {submitting ? 'Logging…' : 'Log Nutrition'}
        </Button>
      </Box>
    </Paper>
  );
}
