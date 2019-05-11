export default `import React from "react";
import useForm from "react-hook-form";

export default function YourForm() {
  const { register, handleSubmit } = useForm();
  const onSubmit = (data, e) => {
    console.log('Submit event', e);
    alert(JSON.stringify(data));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input name="firstName" ref={register} />
      <input name="lastName" ref={register} />
      <button type="submit">Submit</button>
    </form>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
`
