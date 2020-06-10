import React, { useState } from 'react';
import ReactSelect from 'react-select';
import { useForm, Controller } from 'react-hook-form';

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
];

export default function AutoUnregister() {
  const { register, control, handleSubmit } = useForm({
    autoUnregister: false,
  });
  const [show, setShow] = useState(true);

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      {show && (
        <>
          <Controller
            defaultValue=""
            control={control}
            as={<input name={'test'} />}
            name="test"
          />
          <section id="input-ReactSelect">
            <Controller
              render={(props) => (
                <ReactSelect isClearable options={options} {...props} />
              )}
              name="ReactSelect"
              control={control}
              rules={{ required: true }}
            />
          </section>

          <input name="test1" ref={register} />
          <input name="test2" type="checkbox" ref={register} />
          <input name="test3" type="radio" ref={register} />
          <select name="test4" ref={register}>
            <option>Select...</option>
            <option value="bill">Bill</option>
          </select>
        </>
      )}

      <button type="button" onClick={() => setShow(!show)}>
        Toggle Modal
      </button>

      <input type="submit" />
    </form>
  );
}
