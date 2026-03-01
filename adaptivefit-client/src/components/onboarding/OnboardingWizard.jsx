import { useState } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import GoalStep from './GoalStep';
import ExperienceStep from './ExperienceStep';
import ScheduleStep from './ScheduleStep';
import EquipmentStep from './EquipmentStep';
import DietStep from './DietStep';

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
      return true; // Body stats are optional
    default:
      return false;
  }
}

export default function OnboardingWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
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
        return <Box>Body Stats Step (Coming Soon)</Box>;
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
          disabled={activeStep === 0}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!isStepValid(activeStep, formData) || activeStep === stepLabels.length - 1}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}
