import React from "react";
import ReactDOM from "react-dom";
import useForm from "react-hook-form";
import * as yup from "yup";

const SignupSchema = yup.object().shape({
  name: yup.string().required(),
  age: yup
    .number()
    .required()
    .positive()
    .integer(),
  email: yup.string().email(),
  website: yup.string().url(),
  createdOn: yup.date().default(function() {
    return new Date();
  })
});

function App() {
  const { register, handleSubmit, errors } = useForm({
    validationSchema: SignupSchema
  });
  const onSubmit = data => {
    console.log(data);
  };
  console.log(errors);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="radio"
        name="test"
        value="yes"
        ref={register}
      />
      <input
        type="radio"
        name="test"
        value="no"
        ref={register}
      />
      <input type="text" name="first name" ref={register} />
      <input type="text" name="last name" ref={register} />
      <input type="submit" />
    </form>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
