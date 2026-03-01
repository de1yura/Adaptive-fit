import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

const daysMarks = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
];

const durationOptions = [30, 45, 60, 90];

export default function ScheduleStep({ formData, setFormData }) {
  return (
    <Box>
      <Typography variant="h5" align="center" gutterBottom>
        Set your weekly schedule
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
        How many days per week can you train, and how long per session?
      </Typography>

      <Box sx={{ mb: 5, px: 2 }}>
        <Typography variant="h6" gutterBottom>
          Days per week: {formData.daysPerWeek}
        </Typography>
        <Slider
          value={formData.daysPerWeek}
          onChange={(e, value) => setFormData((prev) => ({ ...prev, daysPerWeek: value }))}
          min={1}
          max={7}
          step={1}
          marks={daysMarks}
          valueLabelDisplay="auto"
        />
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Session duration (minutes)
        </Typography>
        <ToggleButtonGroup
          value={formData.sessionDurationMinutes}
          exclusive
          onChange={(e, value) => {
            if (value !== null) {
              setFormData((prev) => ({ ...prev, sessionDurationMinutes: value }));
            }
          }}
          fullWidth
        >
          {durationOptions.map((dur) => (
            <ToggleButton key={dur} value={dur}>
              {dur} min
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
}
