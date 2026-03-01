import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';

export default function PlanHistoryTimeline({ data }) {
  if (!data || data.length <= 1) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Only one plan version so far
      </Alert>
    );
  }

  const sorted = [...data].sort((a, b) => b.version - a.version);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Plan History
      </Typography>
      <Box sx={{ position: 'relative', pl: 4 }}>
        <Box
          sx={{
            position: 'absolute',
            left: 11,
            top: 8,
            bottom: 8,
            width: 2,
            bgcolor: 'divider',
          }}
        />
        {sorted.map((entry) => (
          <Box
            key={entry.version}
            sx={{ position: 'relative', mb: 3, display: 'flex', alignItems: 'flex-start' }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: -28,
                top: 8,
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                border: '2px solid',
                borderColor: 'background.paper',
              }}
            />
            <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Chip label={`v${entry.version}`} size="small" color="primary" />
                <Typography variant="caption" color="text.secondary">
                  {new Date(entry.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>
              <Typography variant="body2">
                {entry.changeSummary || 'Initial plan created'}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
