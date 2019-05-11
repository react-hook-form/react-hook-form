export default `import React from "react";
import useForm from "react-hook-form";

export default function YourForm() {
  const { register, errors, setError } = useForm();

  return (
    <form>
      <input
        name="username"
        onChange={async e => {
          const value = e.target.value;
          if (value === "bill") return setError("username");
          setError("username", "notMatch", "please choose a different username");
        }}
        ref={register}
      />
      {errors.username && errors.username.message}
    </form>
  );
}
`
