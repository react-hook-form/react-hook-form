import React from 'react';
import ReactDOM from 'react-dom';
import useForm from 'react-hook-form';

import './styles.css';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function App() {
  const { register, handleSubmit } = useForm();
  const onSubmit = data => {
    console.log(data);
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="username">User Name</label>
        <input
          name="username"
          placeholder="Jane"
          ref={register({
            validate: async (value) => {
              await sleep(3000);
              return (value === 'bill');
            },
          })}
        />

        <label htmlFor="lastName">Last Name</label>
        <input name="lastName" placeholder="Doe" ref={register} />

        <label htmlFor="email">Email</label>
        <input name="email" placeholder="jane@acme.com" type="email" ref={register} />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
