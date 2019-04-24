export default `
import React from 'react'
import useForm from 'react-hook-form'

function YourForm() {
  const { register, handleSubmit, watch, errors } = useForm()
  const onSubmit = data => {
    console.log(data)
  }; // form submit function will invoke after successful validation

  console.log(watch('example')) // watch individual input by passing the name of the input

  return (
    {/* handleSubmit will validation your inputs before calling onSubmit */}
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* you will have to register your input into Hook by invoking the register function with Ref as the argument */}
      <input type="text" name="example" ref={register} />
      {/* include validation with required field or other standard HTML validation rules */}
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
