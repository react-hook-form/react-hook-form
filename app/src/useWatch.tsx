import * as React from 'react';
import { useForm, Control, useWatch } from 'react-hook-form';
import { useRef } from 'react';

let counter = 0;

const GrandChild = ({ control }: { control: Control }) => {
  const counter1 = useRef(0);
  const output = useWatch({
    name: 'test',
    control,
    defaultValue: 'yay! I am watching you :)',
  });

  counter1.current++;

  return (
    <div style={{ border: '2px solid blue', padding: 10, margin: 5 }}>
      <h2 style={{ margin: 0 }}>Grandchild:</h2>
      {output}
      <p id="grandChildCounter">Render counter: {counter1.current}</p>
    </div>
  );
};

const GrandChild1 = ({ control }: { control: Control }) => {
  const counter = useRef(0);
  const output = useWatch({
    name: ['test', 'test1'],
    control,
    defaultValue: { test: '', test1: '' },
  });

  counter.current++;

  return (
    <div style={{ border: '2px solid blue', padding: 10, margin: 5 }}>
      <h2 style={{ margin: 0 }}>Grandchild:</h2>
      {output.test}
      {output.test1}
      <p id="grandChildCounter">Render counter: {counter.current}</p>
    </div>
  );
};

const GrandChild2 = ({ control }: { control: Control }) => {
  const counter = useRef(0);
  const output = useWatch({
    control,
  });

  counter.current++;

  return (
    <div style={{ border: '2px solid blue', padding: 10, margin: 5 }}>
      <h2 style={{ margin: 0 }}>Grandchild:</h2>
      {output.test}
      {output.test1}
      {output.test2}
      <p id="grandChildCounter">Render counter: {counter.current}</p>
    </div>
  );
};

const Child = ({ control }: { control: Control }) => {
  const counter1 = useRef(0);
  counter1.current++;

  return (
    <div style={{ border: '2px solid green', padding: 10, margin: 5 }}>
      <h2 style={{ margin: 0 }}>Child:</h2>
      <GrandChild control={control} />
      <p id="childCounter" style={{ color: 'red' }}>
        <b>Render counter: {counter1.current} 👀</b>
      </p>
    </div>
  );
};

export default () => {
  const { register, control } = useForm();

  counter++;

  return (
    <div style={{ border: '2px solid red', padding: 10, margin: 5 }}>
      <h2 style={{ margin: 0 }}>Parent:</h2>
      <input
        ref={register}
        name={'test'}
        autoComplete="off"
        placeholder="👀 watching me :)"
        style={{ fontSize: 20 }}
      />

      <input
        ref={register}
        name={'test1'}
        autoComplete="off"
        placeholder="👀 watching me :)"
        style={{ fontSize: 20 }}
      />

      <input
        ref={register}
        name={'test2'}
        autoComplete="off"
        placeholder="👀 watching me :)"
        style={{ fontSize: 20 }}
      />

      <GrandChild control={control} />
      <Child control={control} />
      <GrandChild1 control={control} />
      <GrandChild2 control={control} />

      <p id="parentCounter" style={{ color: 'red' }}>
        <b>Render counter: {counter} 👀</b>
      </p>
    </div>
  );
};
