import React from 'react';
import ReactDOM from 'react-dom';
import { useForm } from 'react-hook-form';

type UnknownArrayOrObject = unknown[] | Record<string, unknown>;

// https://github.com/react-hook-form/react-hook-form/discussions/1991#discussioncomment-351784
export const dirtyValues = (
  dirtyFields: UnknownArrayOrObject | boolean,
  allValues: UnknownArrayOrObject,
): UnknownArrayOrObject => {
  // NOTE: Recursive function.

  // If *any* item in an array was modified, the entire array must be submitted, because there's no
  // way to indicate "placeholders" for unchanged elements. `dirtyFields` is `true` for leaves.
  if (dirtyFields === true || Array.isArray(dirtyFields)) {
    return allValues;
  }

  // Here, we have an object.
  return Object.fromEntries(
    Object.keys(dirtyFields).map((key) => [
      key,
      dirtyValues(dirtyFields[key], allValues[key]),
    ]),
  );
};

export default function App() {
  const { register, handleSubmit, formState } = useForm({
    mode: 'onChange',
  });
  const onSubmit = (data) => {
    alert(JSON.stringify(dirtyValues(formState.dirtyFields, data)));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>First name</label>
        <input type="text" {...register('firstName')} />
      </div>
      <div>
        <label>Last name</label>
        <input type="text" {...register('lastName')} />
      </div>
      <div>
        <label>Email</label>
        <input type="text" {...register('email')} />
      </div>
      <div>
        <label>Mobile number</label>
        <input type="tel" {...register('mobileNumber')} />
      </div>
      <div>
        <label>Title</label>
        <select {...register('title')}>
          <option value="Mr">Mr</option>
          <option value="Mrs">Mrs</option>
          <option value="Miss">Miss</option>
          <option value="Dr">Dr</option>
        </select>
      </div>

      <div>
        <label>Are you a developer?</label>
        <input type="radio" value="Yes" {...register('developer')} />
        <input type="radio" value="No" {...register('developer')} />
      </div>

      <pre>{JSON.stringify(formState, null, 2)}</pre>

      <input type="submit" />
    </form>
  );
}

const rootElement = document.getElementById('root');

ReactDOM.render(<App />, rootElement);
