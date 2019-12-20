import React, { useState } from 'react';
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

const errorStyle = {
  color: 'red',
};

export default function Field() {
  const methods = useForm({ defaultValues });
  const [data, setData] = useState<any>(null);
  const { handleSubmit, errors, register, reset, control } = methods;
  renderCount++;

  return (
    <form onSubmit={handleSubmit(data => setData(data))}>
      <div className="container">
        <section>
          <label>MUI Checkbox</label>
          <Controller
            as={<Checkbox />}
            name="Checkbox"
            control={control}
            rules={{ required: true }}
          />
        </section>

        {errors.Checkbox && (
          <p id={'checkbox'} style={errorStyle}>
            TextField Error
          </p>
        )}

        <section>
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

        {errors.RadioGroup && (
          <p id={'RadioGroup'} style={errorStyle}>
            RadioGroup Error
          </p>
        )}

        <section>
          <label>MUI TextField</label>
          <Controller
            as={<TextField />}
            name="TextField"
            control={control}
            rules={{ required: true }}
          />
        </section>

        {errors.TextField && (
          <p id="TextField" style={errorStyle}>
            Checkbox Error
          </p>
        )}

        <section>
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

        {errors.Select && (
          <p id="Select" style={errorStyle}>
            Select Error
          </p>
        )}

        <section>
          <label>MUI Switch</label>
          <Controller
            as={<Switch value="checkedA" />}
            name="switch"
            rules={{ required: true }}
            control={control}
          />
        </section>

        {errors.switch && (
          <p id="switch" style={errorStyle}>
            switch Error
          </p>
        )}

        <section>
          <label>React Select</label>
          <Controller
            as={<ReactSelect isClearable options={options} />}
            name="ReactSelect"
            control={control}
            rules={{ required: true }}
            onChange={(data: any) => data}
          />
        </section>

        {errors.ReactSelect && (
          <p id="ReactSelect" style={errorStyle}>
            ReactSelect Error
          </p>
        )}
      </div>

      {data && (
        <p style={{ textAlign: 'left' }}>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </p>
      )}

      <span className="counter">{renderCount}</span>

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
      <button>submit</button>
    </form>
  );
}
