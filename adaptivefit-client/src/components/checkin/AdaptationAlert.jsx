import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';

export default function AdaptationAlert({ open, onClose, adaptation }) {
  if (!adaptation) return null;

  const { changeSummary, newPlanVersion, changesApplied, adaptationDetails } = adaptation;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Check-In Results</DialogTitle>
      <DialogContent>
        {changesApplied ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Your plan has been adapted based on your check-in.
          </Alert>
        ) : (
          <Alert severity="success" sx={{ mb: 2 }}>
            You're right on track!
          </Alert>
        )}

        <Typography variant="body1" sx={{ mb: 2 }}>
          {changeSummary}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Plan Version: <strong>{newPlanVersion}</strong>
        </Typography>

        {adaptationDetails?.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            {adaptationDetails.map((detail, idx) => (
              <Chip key={idx} label={detail} size="small" variant="outlined" />
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">OK</Button>
      </DialogActions>
    </Dialog>
  );
}
