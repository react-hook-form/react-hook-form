import React from 'react'
import { Form, useForm } from 'react-hook-form'

export default function FormComponent() {
  const methods = useForm<{
    test: string
  }>({
    defaultValues: {
      test: '',
    },
  })

  return (
    <Form control={methods.control} action={'/test'}>
      <input {...methods.register('test')} />
      <button>Submit</button>
    </Form>
  )
}
