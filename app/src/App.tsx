import React from 'react';
import useForm from 'react-hook-form';
import './App.css';
import { watch } from 'fs';

const App: React.FC = () => {
  const { register, watch } = useForm({
    defaultValues: {
      test: [{
        data: [,2]
      }],
      test1: 'ha',
      test2: 'asd'
    },
  });

  const data = watch('test');
  console.log(data);

  return (
    <form>
      <input name="test[0].data[1]" ref={register} />
      <input name="test1" ref={register} />
      <input name="test2" ref={register} />
    </form>
  );
};

export default App;
