import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import BoltIcon from '@mui/icons-material/Bolt';

const levels = [
  {
    value: 'BEGINNER',
    label: 'Beginner',
    description: 'New to working out or returning after a long break. Focus on learning proper form.',
    icon: <EmojiPeopleIcon sx={{ fontSize: 48 }} />,
  },
  {
    value: 'INTERMEDIATE',
    label: 'Intermediate',
    description: 'Consistent training for 6+ months. Comfortable with compound movements.',
    icon: <DirectionsRunIcon sx={{ fontSize: 48 }} />,
  },
  {
    value: 'ADVANCED',
    label: 'Advanced',
    description: '2+ years of consistent training. Ready for high-volume and advanced techniques.',
    icon: <BoltIcon sx={{ fontSize: 48 }} />,
  },
];

export default function ExperienceStep({ formData, setFormData }) {
  return (
    <Box>
      <Typography variant="h5" align="center" gutterBottom>
        What is your experience level?
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
        We will adjust exercise difficulty and volume to match your level.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {levels.map((level) => {
          const selected = formData.experienceLevel === level.value;
          return (
            <Card
              key={level.value}
              variant={selected ? 'elevation' : 'outlined'}
              sx={{
                border: selected ? 2 : 1,
                borderColor: selected ? 'primary.main' : 'divider',
                bgcolor: selected ? 'primary.50' : 'background.paper',
              }}
            >
              <CardActionArea onClick={() => setFormData((prev) => ({ ...prev, experienceLevel: level.value }))}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                  <Box sx={{ color: selected ? 'primary.main' : 'text.secondary' }}>
                    {level.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6">{level.label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {level.description}
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
