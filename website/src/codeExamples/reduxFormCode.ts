export default `import React from "react";
import { Provider } from "react-redux";
import { Field, reduxForm } from "redux-form";
import store from "./store";

const validate = values => {
  const errors = {};

  if (!values.username) {
    errors.username = "Required";
  } else if (values.username.length !== "admin") {
    errors.username = "Nice try!";
  }

  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = "Invalid email address";
  }

  return errors;
};

const renderField = ({
  input,
  label,
  type,
  meta: { touched, error }
}) => (
  <>
    <input {...input} placeholder={label} type={type} />
    {touched && error && <span>{error}</span>}
  </>
);

const Form = props => {
  const { handleSubmit } = props;
  const onSubmit = values => {
    console.log(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Field name="email" type="email" component={renderField} label="Email" />
    
      <Field
        name="username"
        type="text"
        component={renderField}
        label="Username"
      />
    
      <button type="submit">Submit</button>
    </form>
  );
};

const FormRedux = reduxForm({
  form: "syncValidation",
  validate,
})(Example);

const Example = () => (
  <Provider store={store}>
    <Example/>
  </Provider>
);
`;
