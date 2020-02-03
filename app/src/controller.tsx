import React from 'react';
import { useForm, Controller } from 'react-hook-form';
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
} from '@material-ui/core';

let renderCount = 0;

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
] as any;

const defaultValues = {
  Native: '',
  TextField: '',
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

export default function Field(props: any) {
  const methods = useForm<Form>({
    defaultValues,
    mode: props.match.params.mode,
  });
  const { handleSubmit, errors, reset, control } = methods;

  renderCount++;

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <div className="container">
        <section id="input-checkbox">
          <label>MUI Checkbox</label>
          <Controller
            as={<Checkbox />}
            name="Checkbox"
            control={control}
            rules={{ required: true }}
          />
        </section>

        {errors.Checkbox && <p id={'Checkbox'}>Checkbox Error</p>}

        <section id="input-radio-group">
          <label>Radio Group</label>
          <Controller
            as={
              <RadioGroup aria-label="gender" name="gender1">
                <FormControlLabel
                  value="female"
                  control={<Radio />}
                  label="Female"
                />
                <FormControlLabel
                  value="male"
                  control={<Radio />}
                  label="Male"
                />
              </RadioGroup>
            }
            rules={{ required: true }}
            name="RadioGroup"
            control={control}
          />
        </section>

        {errors.RadioGroup && <p id={'RadioGroup'}>RadioGroup Error</p>}

        <section id="input-textField">
          <label>MUI TextField</label>
          <Controller
            as={<TextField />}
            name="TextField"
            control={control}
            rules={{ required: true }}
          />
        </section>

        {errors.TextField && <p id="TextField">TextField Error</p>}

        <section id="input-select">
          <label>MUI Select</label>
          <Controller
            as={
              <Select>
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
              </Select>
            }
            rules={{ required: true }}
            name="Select"
            control={control}
          />
        </section>

        {errors.Select && <p id="Select">Select Error</p>}

        <section id="input-switch">
          <label>MUI Switch</label>
          <Controller
            as={<Switch value="checkedA" />}
            name="switch"
            rules={{ required: true }}
            control={control}
          />
        </section>

        {errors.switch && <p id="switch">switch Error</p>}

        <section id="input-ReactSelect">
          <label>React Select</label>
          <Controller
            as={<ReactSelect isClearable options={options} />}
            name="ReactSelect"
            control={control}
            rules={{ required: true }}
            onChange={(data: any) => data}
          />
        </section>

        {errors.ReactSelect && <p id="ReactSelect">ReactSelect Error</p>}
      </div>

      <span id="renderCount">{renderCount}</span>

      <button
        id="reset"
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
