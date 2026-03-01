import { useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import ExerciseLogForm from './ExerciseLogForm';

export default function ExerciseRow({ exercise, log, onLogChange, disabled, onSubstitute }) {
  const [showLog, setShowLog] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell>{exercise.exerciseName}</TableCell>
        <TableCell align="center">{exercise.sets}</TableCell>
        <TableCell align="center">{exercise.reps}</TableCell>
        <TableCell align="center">{exercise.restSeconds}s</TableCell>
        <TableCell>{exercise.notes || '—'}</TableCell>
        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
          {!disabled && (
            <Button size="small" onClick={() => setShowLog((v) => !v)} sx={{ mr: 1 }}>
              {showLog ? 'Hide Log' : 'Log'}
            </Button>
          )}
          <Button
            size="small"
            variant="outlined"
            disabled={disabled}
            onClick={() => onSubstitute && onSubstitute(exercise)}
          >
            Substitute
          </Button>
        </TableCell>
      </TableRow>
      {!disabled && (
        <TableRow>
          <TableCell colSpan={6} sx={{ py: 0, borderBottom: showLog ? undefined : 'none' }}>
            <Collapse in={showLog}>
              <ExerciseLogForm log={log} onChange={onLogChange} />
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
