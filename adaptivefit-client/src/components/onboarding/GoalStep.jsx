import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FavoriteIcon from '@mui/icons-material/Favorite';

const goals = [
  {
    value: 'FAT_LOSS',
    label: 'Fat Loss',
    description: 'Lose body fat while preserving muscle mass with calorie-deficit training.',
    icon: <LocalFireDepartmentIcon sx={{ fontSize: 48 }} />,
  },
  {
    value: 'MUSCLE_GAIN',
    label: 'Muscle Gain',
    description: 'Build muscle and strength with progressive overload and calorie surplus.',
    icon: <FitnessCenterIcon sx={{ fontSize: 48 }} />,
  },
  {
    value: 'GENERAL_FITNESS',
    label: 'General Fitness',
    description: 'Improve overall health, endurance, and functional strength.',
    icon: <FavoriteIcon sx={{ fontSize: 48 }} />,
  },
];

export default function GoalStep({ formData, setFormData }) {
  return (
    <Box>
      <Typography variant="h5" align="center" gutterBottom>
        What is your fitness goal?
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
        This helps us tailor your workout and nutrition plan.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {goals.map((goal) => {
          const selected = formData.fitnessGoal === goal.value;
          return (
            <Card
              key={goal.value}
              variant={selected ? 'elevation' : 'outlined'}
              sx={{
                border: selected ? 2 : 1,
                borderColor: selected ? 'primary.main' : 'divider',
                bgcolor: selected ? 'primary.50' : 'background.paper',
              }}
            >
              <CardActionArea onClick={() => setFormData((prev) => ({ ...prev, fitnessGoal: goal.value }))}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                  <Box sx={{ color: selected ? 'primary.main' : 'text.secondary' }}>
                    {goal.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6">{goal.label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {goal.description}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
