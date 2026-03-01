import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function AdherenceChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No workout history yet
      </Alert>
    );
  }

  const formatted = data.map((d) => ({
    week: `Week ${d.week}`,
    Completed: d.completed,
    Planned: d.planned,
  }));

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Weekly Workout Adherence
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formatted} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Planned" fill="#bdbdbd" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Completed" fill="#4caf50" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
