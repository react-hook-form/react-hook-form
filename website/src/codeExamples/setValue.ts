export default `import React from "react";
import useForm from "react-hook-form";

export default function YourForm() {
  const { register, setValue } = useForm();

  return (
    <form>
      <input name="test" ref={register} />
      <button type="button" onClick={() => setValue('test', 'blll')}>SetValue</button>
    </form>
  );
}
`
