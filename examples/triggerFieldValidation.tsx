import React from "react";
import ReactDOM from "react-dom";
import useForm from "react-hook-form";

import "./styles.css";

function App() {
  const { register, errors, trigger } = useForm();

  console.log("errors", errors);

  return (
    <div className="App">
      <h1>validationFeild</h1>
      <label>First name: </label>
      <input name="firstName" ref={register({ required: true })} />

      <label>Last name: </label>
      <input name="lastName" ref={register({ required: true })} />

      <button
        type="button"
        onClick={async () => {
          console.log("firstName", await trigger("firstName"));
          console.log("lastName", await trigger("lastName"));
        }}
      >
        Trigger
      </button>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
