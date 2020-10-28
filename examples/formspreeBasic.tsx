import React from "react";
import ReactDOM from "react-dom";
import { useForm } from "react-hook-form";
import { useForm as useFormspree } from "@formspree/react";

// This does the minimum needed to provide a backend using Formspree:
// 1. Disables the submit button while waiting for a response.
// 2. Does basic server side validation and shows errors. 
//    (ensures there is a valid email address, and that the form is live)
// 3. If successful, replaces the form with a "thanks" message.
//
// Just replace YOUR_FORM_ID with your form id from formspree.io.
// 
// Help docs at: 
// https://help.formspree.io/hc/en-us/articles/360055613373-The-Formspree-React-library

import "./index.css";

function App() {
  const { register, handleSubmit } = useForm();
  const [state, sendToFormspree] = useFormspree("YOUR_FORM_ID");

  if (state.succeeded) {
    return (
      <div className="App">
        <h1>Thanks!</h1>
      </div>
    );
  }

  return (
    <div className="App">
      <form onSubmit={handleSubmit(sendToFormspree)}>
        <div>
          <label htmlFor="nameField">Name</label>
          <input name="name" id="nameField" ref={register} />
        </div>

        <div>
          <label htmlFor="emailField">Email</label>
          <input name="email" id="emailField" type="email" ref={register} />
        </div>

        <input type="submit" disabled={state.submitting} />

        {state.errors.map((err) => (
          <p>{err.message}</p>
        ))}
      </form>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
