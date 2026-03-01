import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import GrassIcon from '@mui/icons-material/Grass';
import SpaIcon from '@mui/icons-material/Spa';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import NoFoodIcon from '@mui/icons-material/NoFood';

const dietOptions = [
  {
    value: 'NO_PREFERENCE',
    label: 'No Preference',
    description: 'No dietary restrictions. All food types included.',
    icon: <RestaurantIcon sx={{ fontSize: 48 }} />,
  },
  {
    value: 'VEGETARIAN',
    label: 'Vegetarian',
    description: 'No meat or fish. Dairy and eggs are included.',
    icon: <GrassIcon sx={{ fontSize: 48 }} />,
  },
  {
    value: 'VEGAN',
    label: 'Vegan',
    description: 'No animal products. Fully plant-based nutrition.',
    icon: <SpaIcon sx={{ fontSize: 48 }} />,
  },
  {
    value: 'HALAL',
    label: 'Halal',
    description: 'Follows halal dietary guidelines for food preparation.',
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 48 }} />,
  },
  {
    value: 'GLUTEN_FREE',
    label: 'Gluten Free',
    description: 'Excludes wheat, barley, rye, and other gluten-containing grains.',
    icon: <NoFoodIcon sx={{ fontSize: 48 }} />,
  },
];

export default function DietStep({ formData, setFormData }) {
  return (
    <Box>
      <Typography variant="h5" align="center" gutterBottom>
        Any dietary preferences?
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
        Your nutrition plan will be tailored to your dietary needs.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {dietOptions.map((option) => {
          const selected = formData.dietaryPreference === option.value;
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
              <CardActionArea onClick={() => setFormData((prev) => ({ ...prev, dietaryPreference: option.value }))}>
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
