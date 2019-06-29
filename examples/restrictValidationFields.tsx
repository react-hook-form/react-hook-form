import React from "react";
import ReactDOM from "react-dom";
import useForm from "react-hook-form";

import "./styles.css";

function App() {
  const { register, errors, handleSubmit } = useForm({
    validationFields: ["lastName"] // will only validate lastName onSubmit
  });

  const onSubmit = data => {
    alert(JSON.stringify(data));
  };
  console.log("errors", errors);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>validationFields</h1>
      <label>First name: </label>
      <input name="firstName" ref={register({ required: true })} />

      <label>Last name: </label>
      <input name="lastName" ref={register({ required: true })} />

      <input type="submit" />
    </form>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
