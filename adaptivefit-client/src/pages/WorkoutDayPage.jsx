import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

export default function WorkoutDayPage() {
  const { dayId } = useParams();
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mt: 4 }}>Workout Day {dayId}</Typography>
    </Container>
  );
}
