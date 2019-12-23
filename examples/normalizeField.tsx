import React from "react";
import ReactDOM from "react-dom";
import { useForm } from 'react-hook-form';

function App() {
  const { register, handleSubmit } = useForm();
  const onSubmit = data => {
    alert(JSON.stringify(data));
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="firstName">First Name</label>
          <input
            name="firstName"
            onChange={e => {
              if (e.target.value) {
                e.target.value = e.target.value.toUpperCase();
              }
            }}
            placeholder="bill"
            ref={register}
          />
        </div>

        <div>
          <label htmlFor="lastName">Last Name</label>
          <input
            name="lastName"
            onChange={e => {
              if (e.target.value) {
                e.target.value = e.target.value.toLowerCase();
              }
            }}
            placeholder="luo"
            ref={register}
          />
        </div>

        <div>
          <label htmlFor="DOB">DOB</label>
          <input
            name="DOB"
            onChange={e => {
              const value = e.target.value;
              if (value.match(/^\d{2}$/) !== null) {
                e.target.value = value + "/";
              } else if (value.match(/^\d{2}\/\d{2}$/) !== null) {
                e.target.value = value + "/";
              }
            }}
            placeholder="12/12/1999"
            ref={register}
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
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

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
