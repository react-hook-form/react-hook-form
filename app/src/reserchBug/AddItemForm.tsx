import React from "react";
import { useForm } from "react-hook-form";

// @ts-expect-error
export const AddItemForm = ({ buttonName, onSubmit }) => {
  const form = useForm();

  return (
    <form
      key="11"
      onSubmit={form.handleSubmit((values) => {
        onSubmit(values.name1);

        form.reset({ name1: "" });
      })}
    >
      <input {...form.register("name1")} style={{ border: "1px solid" }} />
      <button type="submit">save</button>
    </form>
  );
};
