export default `import React from "react";
import { Formik, Form, Field } from "formik";

function validateEmail(value) {
  let error;
  
  if (!value) {
    error = "Required";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,4}$/i.test(value)) {
    error = "Invalid email address";
  }
  
  return error;
}

function validateUsername(value) {
  let error;
  
  if (value === "admin") {
    error = "Nice try!";
  }
  
  return error;
}

const Example = () => {
  const onSubmit = values => {
    console.log(values);
  };

  return (
    <Formik
      initialValues={{
        username: "",
        email: ""
      }}
      onSubmit={onSubmit}
    >
      {({ errors, touched }) => (
        <Form>
          <Field name="email" validate={validateEmail} />
          {errors.email && touched.email && errors.email}

          <Field name="username" validate={validateUsername} />
          {errors.username && touched.username && errors.username}

          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
};
`;
