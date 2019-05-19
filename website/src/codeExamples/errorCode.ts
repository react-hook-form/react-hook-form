export default `import React from 'react'
import useForm from 'react-hook-form'

function YourForm() {
  const { register, errors, handleSubmit } = useForm();
  const onSubmit = data => {
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" name="singleErrorInput" ref={register({ required: true })} />
      {errors.textInput && 'Your input is required'}
    
      {/* refer to the type of error to display message accordingly */}
      <input type="text" name="multipleErrorInput" ref={register({ required: true, maxLength: 50 })} />
      {errors.textInput && errors.textInput.type === 'required' && 'Your input is required'}
      {errors.textInput && errors.textInput.type === 'maxLength' && 'Your input exceed maxLength'}
      
      {/* register with validation */}
      <input type="number" name="numberInput" ref={register({ min: 50 })} />
      {errors.numberInput && 'Your input required to be more than 50'}
      
      {/* register with validation and error message */}
      <input type="text" name="errorMessage" ref={register({ required: 'This is required' })} />
      {errors.errorMessage && errors.errorMessage.message} 
      <input type="submit" /> 
    </form>
  )
}
`;
