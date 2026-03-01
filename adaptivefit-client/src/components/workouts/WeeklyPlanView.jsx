import Grid from '@mui/material/Grid';
import WorkoutDayCard from './WorkoutDayCard';

export default function WeeklyPlanView({ days }) {
  const sortedDays = [...days].sort((a, b) => a.dayNumber - b.dayNumber);

  return (
    <Grid container spacing={3}>
      {sortedDays.map((day) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={day.dayId}>
          <WorkoutDayCard day={day} />
        </Grid>
      ))}
    </Grid>
  );
}
