import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import toast from 'react-hot-toast';
import api from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';
import GoalStep from './GoalStep';
import ExperienceStep from './ExperienceStep';
import ScheduleStep from './ScheduleStep';
import EquipmentStep from './EquipmentStep';
import DietStep from './DietStep';
import BodyStatsStep from './BodyStatsStep';

const stepLabels = ['Goal', 'Experience', 'Schedule', 'Equipment', 'Diet', 'Body Stats'];

const initialFormData = {
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
};

function isStepValid(step, formData) {
  switch (step) {
    case 0:
      return !!formData.fitnessGoal;
    case 1:
      return !!formData.experienceLevel;
    case 2:
      return formData.daysPerWeek >= 1 && formData.daysPerWeek <= 7 && !!formData.sessionDurationMinutes;
    case 3:
      return !!formData.equipmentAccess;
    case 4:
      return !!formData.dietaryPreference;
    case 5:
      return !!formData.goalDurationWeeks;
    default:
      return false;
  }
}

export default function OnboardingWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setOnboardingCompleted } = useAuth();

  const isLastStep = activeStep === stepLabels.length - 1;

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        fitnessGoal: formData.fitnessGoal,
        experienceLevel: formData.experienceLevel,
        daysPerWeek: formData.daysPerWeek,
        sessionDurationMinutes: formData.sessionDurationMinutes,
        equipmentAccess: formData.equipmentAccess,
        dietaryPreference: formData.dietaryPreference,
        goalDurationWeeks: Number(formData.goalDurationWeeks),
      };
      if (formData.heightCm) payload.heightCm = Number(formData.heightCm);
      if (formData.weightKg) payload.weightKg = Number(formData.weightKg);
      if (formData.age) payload.age = Number(formData.age);

      await api.post('/onboarding/submit', payload);
      setOnboardingCompleted(true);
      toast.success('Your personalised plan is ready!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit onboarding');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <GoalStep formData={formData} setFormData={setFormData} />;
      case 1:
        return <ExperienceStep formData={formData} setFormData={setFormData} />;
      case 2:
        return <ScheduleStep formData={formData} setFormData={setFormData} />;
      case 3:
        return <EquipmentStep formData={formData} setFormData={setFormData} />;
      case 4:
        return <DietStep formData={formData} setFormData={setFormData} />;
      case 5:
        return <BodyStatsStep formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {stepLabels.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: 300, mb: 3 }}>
        {renderStep()}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
        >
          Back
        </Button>
        {isLastStep ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isStepValid(activeStep, formData) || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!isStepValid(activeStep, formData)}
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
}
