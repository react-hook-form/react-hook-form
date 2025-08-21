import React, { useState } from 'react';
import { useForm, Controller } from '@bombillazo/rhf-plus';
import {
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
  Alert,
  Paper,
  Divider,
} from '@mui/material';

type FormData = {
  username: string;
  password: string;
};

const defaultValues: FormData = {
  username: '',
  password: '',
};

type RuleSet = 'none' | 'required' | 'minLength' | 'requiredAndMinLength';

const ruleConfigurations = {
  none: {},
  required: { required: 'This field is required' },
  minLength: { minLength: { value: 5, message: 'Minimum 5 characters' } },
  requiredAndMinLength: {
    required: 'This field is required',
    minLength: { value: 5, message: 'Minimum 5 characters' },
  },
} as const;

let renderCount = 0;

export default function ControllerRulesUpdate() {
  const [usernameRules, setUsernameRules] = useState<RuleSet>('none');
  const [passwordRules, setPasswordRules] = useState<RuleSet>('none');

  const methods = useForm<FormData>({
    defaultValues,
    mode: 'onBlur',
  });

  const { control, handleSubmit, formState, reset } = methods;
  const { errors, isValid, isDirty } = formState;

  renderCount++;

  const onSubmit = (data: FormData) => {
    alert(JSON.stringify(data, null, 2));
  };

  const resetForm = () => {
    reset();
    setUsernameRules('none');
    setPasswordRules('none');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Controller Rules Update Demo
      </Typography>

      <Typography variant="body1" paragraph>
        This demo shows how Controller validation rules update dynamically when
        props change. The validation behavior changes immediately when you
        select different rule configurations.
      </Typography>

      <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography color="text.secondary" variant="body2">
          Render count: <strong>{renderCount}</strong> | Form valid:{' '}
          <strong>{isValid ? 'Yes' : 'No'}</strong> | Form dirty:{' '}
          <strong>{isDirty ? 'Yes' : 'No'}</strong>
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Username Field
          </Typography>

          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend">Username Validation Rules</FormLabel>
            <RadioGroup
              value={usernameRules}
              onChange={(e) => setUsernameRules(e.target.value as RuleSet)}
              row
              data-testid="username-rules"
            >
              <FormControlLabel value="none" control={<Radio />} label="None" />
              <FormControlLabel
                value="required"
                control={<Radio />}
                label="Required"
              />
              <FormControlLabel
                value="minLength"
                control={<Radio />}
                label="Min Length (5)"
              />
              <FormControlLabel
                value="requiredAndMinLength"
                control={<Radio />}
                label="Required + Min Length"
              />
            </RadioGroup>
          </FormControl>

          <Controller
            name="username"
            control={control}
            rules={ruleConfigurations[usernameRules]}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Username"
                error={!!fieldState.error}
                helperText={fieldState.error?.message || ' '}
                fullWidth
                data-testid="username-input"
              />
            )}
          />

          {errors.username && (
            <Alert severity="error" sx={{ mt: 1 }} data-testid="username-error">
              {errors.username.message}
            </Alert>
          )}
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Password Field
          </Typography>

          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend">Password Validation Rules</FormLabel>
            <RadioGroup
              value={passwordRules}
              onChange={(e) => setPasswordRules(e.target.value as RuleSet)}
              row
              data-testid="password-rules"
            >
              <FormControlLabel value="none" control={<Radio />} label="None" />
              <FormControlLabel
                value="required"
                control={<Radio />}
                label="Required"
              />
              <FormControlLabel
                value="minLength"
                control={<Radio />}
                label="Min Length (5)"
              />
              <FormControlLabel
                value="requiredAndMinLength"
                control={<Radio />}
                label="Required + Min Length"
              />
            </RadioGroup>
          </FormControl>

          <Controller
            name="password"
            control={control}
            rules={ruleConfigurations[passwordRules]}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Password"
                type="password"
                error={!!fieldState.error}
                helperText={fieldState.error?.message || ' '}
                fullWidth
                data-testid="password-input"
              />
            )}
          />

          {errors.password && (
            <Alert severity="error" sx={{ mt: 1 }} data-testid="password-error">
              {errors.password.message}
            </Alert>
          )}
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={!isValid}
            data-testid="submit-button"
          >
            Submit
          </Button>
          <Button
            onClick={resetForm}
            variant="outlined"
            data-testid="reset-button"
          >
            Reset Form & Rules
          </Button>
        </Box>
      </form>
    </Box>
  );
}
