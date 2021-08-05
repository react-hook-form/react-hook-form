import * as React from "react";
import { useFieldArray, Controller, useForm } from "react-hook-form";
import Headers from "./Header";
import { AddItemForm } from "./AddItemForm";
import "./styles.css";

let renderCount = 0;

// @ts-expect-error
const ControlledFormValue = ({ control, formName }) => {
  const [editMode, setEditMode] = React.useState(false);
  const inputRef = React.useRef(null);

  return (
    <Controller
      control={control}
      name={`${formName}.name`}
      render={({ field }) => {        
        return (
        <div>
          {editMode && (
            <button
              onClick={() => {
                  // @ts-expect-error
                field.onChange(inputRef.current?.value);
                setEditMode(false);
              }}
            >
              save
            </button>
          )}
          <input
            ref={inputRef}
            type={editMode ? "text" : "hidden"}
            // @ts-ignore
            defaultValue={field.value}
          />
          {!editMode && <span>{field.value}</span>}
          <button
            onClick={() => {
              setEditMode((o) => !o);
            }}
          >
            {editMode ? "Edit off" : "Edit on"}
          </button>
        </div>
      )}}
    />
  );
};

export default function App() {
  const { control, handleSubmit } = useForm();
  const { fields, insert, append, prepend } = useFieldArray({
    control,
    name: "test"
  });
  // @ts-expect-error
  const onSubmit = (data) => console.log(data);
  renderCount++;

  // const form2 = useForm();

  return (
    <div>
      <Headers
        renderCount={renderCount}
        description="Performant, flexible and extensible forms with easy-to-use validation."
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => {
          return (
            <fieldset key={field.id}>
              <ControlledFormValue
                control={control}
                formName={`test.${index}`}
              />
            </fieldset>
          );
        })}
      </form>
      {/* Used RHF */}
      <AddItemForm
        key='1'
        buttonName="Add any element"
        onSubmit={(name: string) => {
          insert(0, {
            name: name
          });
          // prepend({
          //   name
          // })
        }}
      />
      {/* Plain Form */}
      <form
        key="2"
        onSubmit={(e) => {
          e.preventDefault();
          // @ts-expect-error
          let formData = new FormData(e.target);

          insert(0, {
            name: formData.get("name3")
          });
          // prepend({
          //   name: formData.get("name3")
          // })

          // @ts-expect-error
          e.target.reset();
        }}
      >
        <input name="name3" />
        <button>Submit</button>
      </form>
          {/* <form
            onSubmit={form2.handleSubmit((values) => {
              console.log("🚀 ~ file: reserchBug.tsx ~ line 111 ~ onSubmit={form2.handleSubmit ~ values", values)
              insert(0, {
                name: values.name1
              });

              form2.reset({ name1: "" });
            })}
          >
            <input {...form2.register("name1")} style={{ border: "1px solid" }} />
            <button type="submit">save</button>
          </form> */}
    </div>
  );
}


