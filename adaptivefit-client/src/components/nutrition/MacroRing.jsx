import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

export default function MacroRing({ label, current, target, color = 'primary', unit = 'g' }) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }} role="group" aria-label={`${label}: ${current} of ${target} ${unit}`}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={100}
          thickness={4}
          sx={{ color: 'grey.200', position: 'absolute' }}
          aria-hidden="true"
        />
        <CircularProgress
          variant="determinate"
          value={percentage}
          size={100}
          thickness={4}
          color={color}
          aria-label={`${label} progress: ${Math.round(percentage)}%`}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2" fontWeight="bold" color="text.primary">
            {Math.round(percentage)}%
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" fontWeight="bold">{label}</Typography>
      <Typography variant="caption" color="text.secondary">
        {current} / {target} {unit}
      </Typography>
    </Box>
  );
}
