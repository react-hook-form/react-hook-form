import * as React from 'react';
import { useForm, Control, useWatch, Controller } from 'react-hook-form';
import { useRef } from 'react';

let counter = 0;

const GrandChild = ({
  control,
  index = 0,
}: {
  control: Control;
  index?: number;
}) => {
  const counter1 = useRef(0);
  const output = useWatch<string>({
    name: 'test',
    control,
    defaultValue: 'yay! I am watching you :)',
  });

  counter1.current++;

  return (
    <div style={{ border: '2px solid blue', padding: 10, margin: 5 }}>
      <h2 style={{ margin: 0 }}>Grandchild 0:</h2>
      <p id={`grandchild0${index}`}>{output}</p>
      <p id="grandChildCounter">Render counter: {counter1.current}</p>
    </div>
  );
};

const GrandChild1 = ({ control }: { control: Control }) => {
  const counter = useRef(0);
  const output = useWatch<{ test: string; test1: string }>({
    name: ['test', 'test1'],
    control,
    defaultValue: { test: '', test1: '' },
  });

  counter.current++;

  return (
    <div style={{ border: '2px solid blue', padding: 10, margin: 5 }}>
      <h2 style={{ margin: 0 }}>Grandchild 1:</h2>
      <p id="grandchild1">
        {output.test}
        {output.test1}
      </p>
      <p id="grandChild1Counter">Render counter: {counter.current}</p>
    </div>
  );
};

const GrandChild2 = ({ control }: { control: Control }) => {
  const counter = useRef(0);
  const output = useWatch<{
    test: string;
    test1: string;
    test2: string;
  }>({
    control,
  });

  counter.current++;

  return (
    <div style={{ border: '2px solid blue', padding: 10, margin: 5 }}>
      <h2 style={{ margin: 0 }}>Grandchild 2:</h2>
      <p id="grandchild2">
        {output.test}
        {output.test1}
        {output.test2}
      </p>
      <p id="grandChild2Counter">Render counter: {counter.current}</p>
    </div>
  );
};

const Child = ({ control }: { control: Control }) => {
  const counter1 = useRef(0);
  counter1.current++;

  return (
    <div style={{ border: '2px solid green', padding: 10, margin: 5 }}>
      <h2 style={{ margin: 0 }}>Child:</h2>
      <GrandChild index={1} control={control} />
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

      <Controller
        name={'test1'}
        control={control}
        placeholder="👀 watching me :)"
        autoComplete="off"
        style={{ fontSize: 20 }}
        as={<input />}
        defaultValue=""
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
