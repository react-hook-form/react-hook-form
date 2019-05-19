export default `import React from 'react'
import useForm from 'react-hook-form'

export default function YourForm(props) {
  const { register, watch } = useForm()
  const watchYes = watch('yes', props.yes) // supply default value as second argument
  const watchAllFields = watch() // watching every fields in the form
  const watchFields = watch(['yes', 'number']) // target specific fields by their names
  
  return (
    <form>
      <input type="text" name="textInput" ref={register({ required: true, maxLength: 50 })} />
      <input type="checkbox" name="yes" ref={register} />
      
      {watchYes && <input type="number" name="numberInput" ref={register({ min: 50 })} />}
      {/* based on yes selection to display numberInput */}
    </form>
  )
}
`;
