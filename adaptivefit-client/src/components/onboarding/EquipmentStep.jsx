import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HomeIcon from '@mui/icons-material/Home';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';

const equipmentOptions = [
  {
    value: 'FULL_GYM',
    label: 'Full Gym',
    description: 'Access to a fully equipped gym with barbells, cables, machines, and more.',
    icon: <FitnessCenterIcon sx={{ fontSize: 48 }} />,
  },
  {
    value: 'HOME_BASIC',
    label: 'Home Basic',
    description: 'Home setup with dumbbells and basic equipment. No machines or cables.',
    icon: <HomeIcon sx={{ fontSize: 48 }} />,
  },
  {
    value: 'BODYWEIGHT_ONLY',
    label: 'Bodyweight Only',
    description: 'No equipment needed. All exercises use your own body weight.',
    icon: <SelfImprovementIcon sx={{ fontSize: 48 }} />,
  },
];

export default function EquipmentStep({ formData, setFormData }) {
  return (
    <Box>
      <Typography variant="h5" align="center" gutterBottom>
        What equipment do you have access to?
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
        We will only include exercises you can do with your available equipment.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {equipmentOptions.map((option) => {
          const selected = formData.equipmentAccess === option.value;
          return (
            <Card
              key={option.value}
              variant={selected ? 'elevation' : 'outlined'}
              sx={{
                border: selected ? 2 : 1,
                borderColor: selected ? 'primary.main' : 'divider',
                bgcolor: selected ? 'primary.50' : 'background.paper',
              }}
            >
              <CardActionArea onClick={() => setFormData((prev) => ({ ...prev, equipmentAccess: option.value }))}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                  <Box sx={{ color: selected ? 'primary.main' : 'text.secondary' }}>
                    {option.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6">{option.label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
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
