export default `import React from 'react'
import useForm from 'react-hook-form

function YourForm() {
  const { register, errors, handleSubmit } = useForm();
  const onSubmit = (data) => {};
  
  return (
    <form onsubmit={handleSubmit(onSubmit)}>
      <input type="text" name="textInput" ref={ ref => { register({ ref, required, maxLength: 50 })} } />
      {errors.textInput && errors.textInput.required && 'Your input is required'}
      {errors.textInput && errors.textInput.maxLength && 'Your input exceed maxLength'}
      
      <input type="number" name="numberInput" ref={ ref => { register({ ref, min: 50 })} } />
      {/* if you have register input with standard, then you have to define error message like below in code */}
      {errors.numberInput && 'Your input required to be more than 50'}
      {/* if you have register input with error message, then your errors will contain error message */}
      {errors.numberInput} 
      <input type="submit" /> 
    </form>
  )
}
`;
