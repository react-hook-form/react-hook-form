import React from "react";
import ReactDOM from "react-dom";
import useForm from "react-hook-form";

import "./styles.css";

function App() {
  const { register, handleSubmit } = useForm();
  const onSubmit = data => {
    console.log(data);
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="firstName">First Name</label>
        <input
          name="firstName"
          placeholder="Jane"
          ref={ref => register({ ref })}
        />

        <label htmlFor="lastName">Last Name</label>
        <input
          name="lastName"
          placeholder="Doe"
          ref={ref => register({ ref })}
        />

        <label htmlFor="email">Email</label>
        <input
          name="email"
          placeholder="jane@acme.com"
          type="email"
          ref={ref => register({ ref })}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
