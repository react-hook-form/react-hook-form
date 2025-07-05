import React, { useState } from 'react';
import { useForm, Controller, ValidationMode } from 'react-hook-form';
import ReactSelect from 'react-select';
import {
  TextField,
  Checkbox,
  Select,
  MenuItem,
  Switch,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { useParams } from 'react-router-dom';

let renderCount = 0;

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
] as const;

const defaultValues = {
  Native: '',
  TextField: 'asd',
  Select: '',
  ReactSelect: '',
  Checkbox: false,
  switch: false,
  RadioGroup: '',
};

type Form = {
  Native: string;
  TextField: string;
  Select: string;
  ReactSelect: string;
  Checkbox: boolean;
  switch: boolean;
  RadioGroup: string;
};

const PureReactSelect = React.memo(ReactSelect);

export default function Field() {
  const { mode } = useParams();
  const methods = useForm<Form>({
    defaultValues,
    mode: mode as keyof ValidationMode,
  });
  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = methods;

  const [, setRerender] = React.useState(0);
  renderCount++;

  const rerender = () => setRerender(Math.random());

  const [isRulesEnabled, setIsRulesEnabled] = useState(false);

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <div className="container">
        {/* <section id="input-checkbox">
          <label>MUI Checkbox</label>
          <Controller
            name="Checkbox"
            control={control}
            rules={isRulesEnabled ? { required: true } : undefined}
            //rules={{required: isRulesEnabled}}
            render={({ field: props }) => (
              <Checkbox
                {...props}
                onChange={(e) => props.onChange(e.target.checked)}
              />
            )}
          />
        </section>

        {errors.Checkbox && <p id="Checkbox">Checkbox Error</p>} */}

        <section id="input-textField">
          <p>isRulesEnabled: {String(isRulesEnabled)}</p>
          <label>MUI TextField</label>
          <Controller
            render={({ field }) => <TextField {...field} />}
            name="TextField"
            control={control}
            rules={isRulesEnabled ? {minLength: 5}: undefined}
          />
        </section>
        {errors.TextField && <p id='TextField'>TextField error</p>}

      </div>
     

      <span id="renderCount">{renderCount}</span>

      <button type="button" onClick={() => setIsRulesEnabled(!isRulesEnabled)}>
        Toggle error
      </button>

      <button type="button" onClick={rerender}>
        Rerender
      </button>

      <button
        type="button"
        onClick={() => {
          reset({
            Native: '',
            TextField: '',
            Select: '',
            ReactSelect: '',
            Checkbox: false,
            switch: false,
            RadioGroup: '',
          });
        }}
      >
        Reset Form
      </button>
      <button id="submit">submit</button>
    </form>
  );
}
