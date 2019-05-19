export default `import React from 'react'
import useForm from 'react-hook-form'

function YourForm() {
  const { register, handleSubmit, watch, errors } = useForm()
  const onSubmit = data => { console.log(data) };

  console.log(watch('example')) // watch input by passing the name of it

  return (
    {/* handleSubmit will validation your inputs before invoking onSubmit */}
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* register your input into Hook by invoking the register function */}
      <input type="text" name="example" defaultValue="test" ref={register} />
      
      {/* include validation with required or other standard HTML validation rules */}
      <input type="text" name="exampleRequired" ref={register({ required: true })} />
      {/* errors will return when field validation failed  */}
      {errors.example && '<span>This field is required</span>'}
      
      <input type="submit" />
    </form>
  )
}
`;
