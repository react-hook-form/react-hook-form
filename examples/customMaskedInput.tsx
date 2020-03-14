import React from "react";
import MaskedInput from "react-input-mask";
import { useForm } from "react-hook-form";

import "./styles.css";

const isNotFilledTel = v =>
  v && v.indexOf("_") === -1 ? undefined : "Phone number is required.";

const Input = React.memo(props => {
  const { name, inputRef, value, maskChar, ...inputProps } = props;
  return <input value={value} name={name} ref={inputRef} {...inputProps} />;
});

const onSubmit = data => {
  console.log(data);
};

export default function App() {
  const { register, handleSubmit, errors } = useForm();
  const [tel, setTel] = React.useState("");

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <MaskedInput
            value={tel}
            name="maskedInputTel"
            inputRef={register({
              validate: {
                inputTelRequired: isNotFilledTel
              }
            })}
            mask="+7 (999) 999-99-99"
            alwaysShowMask
            onChange={e => setTel(e.target.value)}
          >
            <Input type="tel" autoComplete="tel-national" />
          </MaskedInput>
          {errors.maskedInputTel && <p>{errors.maskedInputTel.message}</p>}
        </div>
        <input type="submit" />
      </form>
    </div>
  );
}
