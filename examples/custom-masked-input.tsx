import React from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";

export const Wrapper = styled.div`
  position: relative;
  margin: 10px;
`;
export const Form = styled.form``;
export const Button = styled.button`
  font-size: 14px;
  font-weight: 600;
  border-radius: 4px;
  border: none;
  height: 50px;
  width: 100%;
  color: #474c51;
  margin-top: 10px;
  cursor: pointer;

  &:focus {
    outline: 0;
  }
`;

export const InputWrapper = styled.div`
  position: relative;
  margin: 20px 0;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #999999;
  position: absolute;
  pointer-events: none;
  top: 18px;
  left: 19px;
  transition: all 0.2s ease;
  opacity: 0.5;
  display: flex;
  align-items: center;
  padding: 0 10px;
`;

export const Input = styled.input`
  border-radius: 4px;
  height: 50px;
  border: 1px solid #c7c7c7;
  font-size: 14px;
  font-weight: 600;
  color: #474c51;
  width: 100%;
  padding-left: 19px;

  &:focus,
  &:active {
    outline: 0;
  }

  &:focus + ${Label}, &:not(:placeholder-shown) + ${Label} {
    opacity: 1;
    transform: translateY(-170%);
    font-size: 12px;
    font-weight: 600;
    background-color: white;
  }

  /* For IE Browsers*/
  &:focus + ${Label}, &:not(:-ms-input-placeholder) + ${Label} {
    opacity: 1;
    transform: translateY(-130%);
    background-color: white;
  }
`;

export const maskPhoneNumber = (phone) => {
  //Example: 0(999) 999 99 99
  const x = phone
    .replace(/\D/g, "")
    .match(/(\d?)(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
  return !x[3]
    ? x[1] + x[2]
    : `${x[1]}(${x[2]}) ${x[3]}${x[4] ? ` ${x[4]}` : ""}${
      x[5] ? ` ${x[5]}` : ""
    }`;
};

export default function App() {
  const { register, handleSubmit, setValue } = useForm();

  const onSubmit = (data) => console.log(data);

  return (
    <Wrapper>
      <Form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <InputWrapper>
          <Input
            type="tel"
            placeholder=" "
            name="phoneNumber"
            ref={register}
            onChange={(e) =>
              setValue("phoneNumber", maskPhoneNumber(e.target.value))
            }
          />
          <Label>Cep Telefonu Numarası</Label>
          <Button>Kaydet</Button>
        </InputWrapper>
      </Form>
    </Wrapper>
  );
};
