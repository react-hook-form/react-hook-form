export default `import React from 'react'
import useForm from 'react-hook-form'

function YourForm() {
  const { register, handleSubmit, watch, errors } = useForm()
  const onSubmit = data => {
    console.log(data)
  }; // your form submit function which will invoke after successful validation

  console.log(watch('example')) // you can watch individual input by pass the name of the input

  return (
    {/* handleSubmit will validation your inputs before calling onSubmit */}
    <form onsubmit={handleSubmit(onSubmit)}>
      {/* you will have to register your input into react-hook-form, by invoke the register function with ref as the argument */}
      <input
        type="text"
        name="example"
        ref={register}
      />
      {/* include validation with required field or other standard html validation rules */}
      <input
        type="text"
        name="exampleRequired"
        ref={register({ required: true, maxLength: 10 })}
      />
      {/* errors will return true if particular field validation is invalid  */}
      {errors.example && '<span>This field is required</span>'}
      <input type="submit" />
    </form>
  )
}
`;
