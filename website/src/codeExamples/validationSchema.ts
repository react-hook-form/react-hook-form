export default `import React from 'react'
import ReactDOM from 'react-dom'
import useForm from 'react-hook-form'
import * as yup from 'yup'

const SignupSchema = yup.object().shape({
  name: yup.string().required(),
  age: yup.number().required(),
});

export default function YourForm() {
  const { register, handleSubmit, errors } = useForm({
    validationSchema: SignupSchema
  });
  const onSubmit = data => { console.log(data); };
  console.log(errors);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" name="name" ref={register} />
      <input type="number" name="age" ref={register} />
      <input type="submit" />
    </form>
  )
}
`
