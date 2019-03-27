export default `import React from 'react'
import useForm from 'react-hook-form

function YourForm() {
  const { register, errors, handleSubmit } = useForm();
  const onSubmit = (data) => {};
  
  return (
    <form onsubmit={handleSubmit(onSubmit)}>
      <input type="text" name="singleErrorInput" ref={ ref => { register({ ref, required })} } />
      {errors.textInput && 'Your input is required'}
    
      {/* When you have multiple error messages to support your validation, you can refer to the type of errors */}
      <input type="text" name="multipleErrorInput" ref={ ref => { register({ ref, required, maxLength: 50 })} } />
      {errors.textInput && errors.textInput.type === 'required' && 'Your input is required'}
      {errors.textInput && errors.textInput.type === 'maxLength' && 'Your input exceed maxLength'}
      
      {/* if you have register input with standard, then you have to define error message like below in code */}
      <input type="number" name="numberInput" ref={ ref => { register({ ref, min: 50 })} } />
      {errors.numberInput && 'Your input required to be more than 50'}
      
      {/* if you have register input with error message, then your errors will contain error message */}
      {errors.numberInput && errors.numberInput.message} 
      <input type="submit" /> 
    </form>
  )
}
`;
