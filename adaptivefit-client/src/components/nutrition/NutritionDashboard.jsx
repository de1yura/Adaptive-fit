import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import MacroRing from './MacroRing';

export default function NutritionDashboard({ targets, todayLog }) {
  const consumed = {
    calories: todayLog?.caloriesConsumed || 0,
    protein: todayLog?.proteinG || 0,
    carbs: todayLog?.carbsG || 0,
    fats: todayLog?.fatsG || 0,
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Daily Targets</Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: 3,
          mt: 2,
        }}
      >
        <MacroRing
          label="Calories"
          current={consumed.calories}
          target={targets.dailyCalories}
          color="warning"
          unit="cal"
        />
        <MacroRing
          label="Protein"
          current={consumed.protein}
          target={targets.proteinG}
          color="error"
        />
        <MacroRing
          label="Carbs"
          current={consumed.carbs}
          target={targets.carbsG}
          color="info"
        />
        <MacroRing
          label="Fats"
          current={consumed.fats}
          target={targets.fatsG}
          color="success"
        />
      </Box>
    </Paper>
  );
}
