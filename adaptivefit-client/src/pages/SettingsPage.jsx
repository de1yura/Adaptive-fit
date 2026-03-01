import { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import toast from 'react-hot-toast';
import { getProfile, updateProfile, changePassword } from '../api/settingsApi';
import { exportData } from '../api/progressApi';

const fitnessGoalOptions = [
  { value: 'FAT_LOSS', label: 'Fat Loss' },
  { value: 'MUSCLE_GAIN', label: 'Muscle Gain' },
  { value: 'GENERAL_FITNESS', label: 'General Fitness' },
];

const experienceLevelOptions = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

const equipmentAccessOptions = [
  { value: 'FULL_GYM', label: 'Full Gym' },
  { value: 'HOME_BASIC', label: 'Home Basic' },
  { value: 'BODYWEIGHT_ONLY', label: 'Bodyweight Only' },
];

const dietaryPreferenceOptions = [
  { value: 'NO_PREFERENCE', label: 'No Preference' },
  { value: 'VEGETARIAN', label: 'Vegetarian' },
  { value: 'VEGAN', label: 'Vegan' },
  { value: 'HALAL', label: 'Halal' },
  { value: 'GLUTEN_FREE', label: 'Gluten Free' },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profile, setProfile] = useState({
    fitnessGoal: '',
    experienceLevel: '',
    daysPerWeek: 3,
    sessionDurationMinutes: 45,
    equipmentAccess: '',
    dietaryPreference: '',
    heightCm: '',
    weightKg: '',
    age: '',
    goalDurationWeeks: '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setProfile({
          fitnessGoal: res.data.fitnessGoal || '',
          experienceLevel: res.data.experienceLevel || '',
          daysPerWeek: res.data.daysPerWeek || 3,
          sessionDurationMinutes: res.data.sessionDurationMinutes || 45,
          equipmentAccess: res.data.equipmentAccess || '',
          dietaryPreference: res.data.dietaryPreference || '',
          heightCm: res.data.heightCm ?? '',
          weightKg: res.data.weightKg ?? '',
          age: res.data.age ?? '',
          goalDurationWeeks: res.data.goalDurationWeeks || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        ...profile,
        daysPerWeek: Number(profile.daysPerWeek),
        sessionDurationMinutes: Number(profile.sessionDurationMinutes),
        goalDurationWeeks: Number(profile.goalDurationWeeks),
        heightCm: profile.heightCm !== '' ? Number(profile.heightCm) : null,
        weightKg: profile.weightKg !== '' ? Number(profile.weightKg) : null,
        age: profile.age !== '' ? Number(profile.age) : null,
      };
      await updateProfile(payload);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPasswordErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleChangePassword = async () => {
    const errors = {};
    if (!passwords.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwords.newPassword) errors.newPassword = 'New password is required';
    else if (passwords.newPassword.length < 8) errors.newPassword = 'Must be at least 8 characters';
    if (!passwords.confirmPassword) errors.confirmPassword = 'Please confirm your new password';
    else if (passwords.newPassword !== passwords.confirmPassword) errors.confirmPassword = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await exportData();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'adaptivefit-export.json';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to export data.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Skeleton variant="text" width={200} height={48} />
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mt: 2 }} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>Settings</Typography>
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>Settings</Typography>

        {/* Profile Section */}
        <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>Profile</Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              select
              label="Fitness Goal"
              name="fitnessGoal"
              value={profile.fitnessGoal}
              onChange={handleProfileChange}
              fullWidth
            >
              {fitnessGoalOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Experience Level"
              name="experienceLevel"
              value={profile.experienceLevel}
              onChange={handleProfileChange}
              fullWidth
            >
              {experienceLevelOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Days Per Week"
              name="daysPerWeek"
              type="number"
              value={profile.daysPerWeek}
              onChange={handleProfileChange}
              inputProps={{ min: 1, max: 7 }}
              fullWidth
            />

            <TextField
              label="Session Duration (minutes)"
              name="sessionDurationMinutes"
              type="number"
              value={profile.sessionDurationMinutes}
              onChange={handleProfileChange}
              inputProps={{ min: 15, max: 180 }}
              fullWidth
            />

            <TextField
              select
              label="Equipment Access"
              name="equipmentAccess"
              value={profile.equipmentAccess}
              onChange={handleProfileChange}
              fullWidth
            >
              {equipmentAccessOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Dietary Preference"
              name="dietaryPreference"
              value={profile.dietaryPreference}
              onChange={handleProfileChange}
              fullWidth
            >
              {dietaryPreferenceOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Height (cm)"
              name="heightCm"
              type="number"
              value={profile.heightCm}
              onChange={handleProfileChange}
              fullWidth
            />

            <TextField
              label="Weight (kg)"
              name="weightKg"
              type="number"
              value={profile.weightKg}
              onChange={handleProfileChange}
              fullWidth
            />

            <TextField
              label="Age"
              name="age"
              type="number"
              value={profile.age}
              onChange={handleProfileChange}
              fullWidth
            />

            <TextField
              label="Goal Duration (weeks)"
              name="goalDurationWeeks"
              type="number"
              value={profile.goalDurationWeeks}
              onChange={handleProfileChange}
              inputProps={{ min: 1 }}
              fullWidth
            />
          </Box>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleSaveProfile}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : null}
            >
              Save Changes
            </Button>
          </Box>
        </Paper>

        <Divider sx={{ my: 3 }} />

        {/* Account Section */}
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Change Password</Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
            <TextField
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              error={!!passwordErrors.currentPassword}
              helperText={passwordErrors.currentPassword}
              fullWidth
            />

            <TextField
              label="New Password"
              name="newPassword"
              type="password"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword}
              fullWidth
            />

            <TextField
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              error={!!passwordErrors.confirmPassword}
              helperText={passwordErrors.confirmPassword}
              fullWidth
            />

            <Box>
              <Button
                variant="contained"
                onClick={handleChangePassword}
                disabled={changingPassword}
                startIcon={changingPassword ? <CircularProgress size={20} /> : null}
              >
                Change Password
              </Button>
            </Box>
          </Box>
        </Paper>

        <Divider sx={{ my: 3 }} />

        {/* Export Data Section */}
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Export Data</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Download all your progress data as a JSON file.
          </Typography>
          <Button variant="outlined" onClick={handleExportData}>
            Export Data
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
