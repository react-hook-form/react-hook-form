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
  defaultValues: {
    Native: '',
    TextField: '',
    Select: '',
    ReactSelect: '',
    Checkbox: false,
    switch: false,
    RadioGroup: '',
  },
};

export default function Field() {
  const methods = useForm({ defaultValues });
  const [data, setData] = useState<any>(null);
  const { handleSubmit, register, reset, control } = methods;
  renderCount++;

  return (
    <form onSubmit={handleSubmit(data => setData(data))}>
      <h1>React Hook Form Input</h1>
      <p>React Hook Form work with controlled component.</p>
      <span className="counter">Render Count: {renderCount}</span>
      <div className="container">
        <section>
          <label>Native Input:</label>
          <input name="Native" ref={register} />
        </section>

        <section>
          <label>MUI Checkbox</label>
          <Controller as={<Checkbox />} name="Checkbox" control={control} />
        </section>

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
            name="RadioGroup"
            control={control}
          />
        </section>

        <section>
          <label>MUI TextField</label>
          <Controller as={<TextField />} name="TextField" control={control} />
        </section>

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
            name="Select"
            control={control}
          />
        </section>

        <section>
          <label>MUI Switch</label>
          <Controller
            as={<Switch value="checkedA" />}
            name="switch"
            control={control}
          />
        </section>

        <section>
          <label>React Select</label>
          <Controller
            as={<ReactSelect isClearable options={options} />}
            name="ReactSelect"
            control={control}
            onChange={(data: any) => data}
          />
        </section>
      </div>

      {data && (
        <p style={{ textAlign: 'left' }}>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </p>
      )}

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
