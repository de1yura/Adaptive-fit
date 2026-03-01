import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const durationOptions = [4, 8, 12, 16, 24];

export default function BodyStatsStep({ formData, setFormData }) {
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box>
      <Typography variant="h5" align="center" gutterBottom>
        Body Stats & Goal Duration
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
        Body stats are optional but help us calculate more accurate nutrition targets.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 400, mx: 'auto' }}>
        <TextField
          label="Height (cm)"
          type="number"
          value={formData.heightCm}
          onChange={handleChange('heightCm')}
          inputProps={{ min: 0 }}
        />
        <TextField
          label="Weight (kg)"
          type="number"
          value={formData.weightKg}
          onChange={handleChange('weightKg')}
          inputProps={{ min: 0 }}
        />
        <TextField
          label="Age"
          type="number"
          value={formData.age}
          onChange={handleChange('age')}
          inputProps={{ min: 0 }}
        />
        <FormControl required>
          <InputLabel>Goal Duration (weeks)</InputLabel>
          <Select
            value={formData.goalDurationWeeks || ''}
            label="Goal Duration (weeks)"
            onChange={handleChange('goalDurationWeeks')}
          >
            {durationOptions.map((weeks) => (
              <MenuItem key={weeks} value={weeks}>
                {weeks} weeks
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}
