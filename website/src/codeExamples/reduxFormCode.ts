export default `import React from 'react';
import { Field, reduxForm } from 'redux-form';

const validate = values => {
  const errors = {};
  
  if (!values.username) {
    errors.username = 'Required';
  } else if (values.username.length !== 'admin) {
    errors.username = 'Nice try!';
  }
  
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }
  
  return errors;
}

const renderField = ({
  input,
  label,
  type,
}) => (
  <div>
    <label>{label}</label>
    <div>
      <input {...input} placeholder={label} type={type} />
    </div>
  </div>
)

const Example = props => {
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
}

export default reduxForm({
  form: 'syncValidation',
})(SyncValidationForm)
`;
