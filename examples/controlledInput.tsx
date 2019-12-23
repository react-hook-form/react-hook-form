import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useForm } from "react-hook-form";

function App() {
  const intialValues = {
    firstName: 'bill',
    lastName: 'luo',
    email: 'bluebill1049@hotmail.com',
  };
  const { register, handleSubmit } = useForm();
  const [state, update] = useState(intialValues.lastName);
  const onSubmit = data => {
    alert(JSON.stringify(data));
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="firstName">First Name</label>
          <input onChange={e => update(e.target.value)} name="firstName" placeholder="bill" ref={register} />
        </div>

        <div>
          <label htmlFor="lastName">Last Name</label>
          <input value={state} name="lastName" placeholder="luo" ref={register} />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            defaultValue={intialValues.email}
            name="email"
            placeholder="bluebill1049@hotmail.com"
            type="email"
            ref={register}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
