import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function WorkoutDayCard({ day }) {
  const navigate = useNavigate();

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardActionArea onClick={() => navigate(`/workouts/${day.dayId}`)} sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {day.dayLabel}
            </Typography>
            {day.completed && (
              <Chip
                icon={<CheckCircleIcon />}
                label="Done"
                color="success"
                size="small"
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {day.focusArea}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {day.exerciseCount} exercise{day.exerciseCount !== 1 ? 's' : ''}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
