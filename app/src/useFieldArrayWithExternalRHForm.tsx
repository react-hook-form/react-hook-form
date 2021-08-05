import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';

let renderCount = 0;

type FormValues = { data: { name: string }[] };

type NewItemFormValues = {
    name: string;
}

type NewItemFormProps = {
    onSubmit: (name: string) => void;
    buttonName: string;
    buttonId: string;
}

export const NewItemForm: React.FC<NewItemFormProps> = ({ onSubmit, buttonName, buttonId }) => {
    const form = useForm<NewItemFormValues>();
  
    return (
      <form
        onSubmit={form.handleSubmit((values) => {
          onSubmit(values.name);
  
          form.reset({ name: "" });
        })}
      >
        <input {...form.register("name")} style={{ border: "1px solid" }} />
        <button
        	id={buttonId}
        	type="submit"
        >
            {buttonName}
        </button>
      </form>
    );
  };

const UseFieldArrayWithExternalRHForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    register,
    formState: { isDirty, touchedFields, isValid, dirtyFields, errors },
  } = useForm<FormValues>();
  const { fields, append, prepend, insert, update } =
    useFieldArray({
      control,
      name: 'data',
    });
  const [data, setData] = React.useState<FormValues>();
  const onSubmit = (data: FormValues) => {
    setData(data);
  };

  renderCount++;

  return (
		<div>
    <form onSubmit={handleSubmit(onSubmit)}>
      <ul>
        {fields.map((data, index) => (
          <li key={data.id}>
            {index % 2 ? (
              <input
                id={`field${index}`}
                data-order={index}
                {...register(`data.${index}.name` as const, {
                  required: 'This is required',
                })}
              />
            ) : (
              <Controller
                render={({ field }) => (
                  <input id={`field${index}`} {...field} />
                )}
                control={control}
                rules={{
                  required: 'This is required',
                }}
                name={`data.${index}.name`}
                data-order={index}
              />
            )}
            {errors.data?.[index]?.name && (
              <p id={`error${index}`}>{errors.data[index]!.name!.message}</p>
            )}
          </li>
        ))}
      </ul>

      <button id="submit">Submit</button>
    </form>
		<NewItemForm
			buttonId="append"
			buttonName="append"
			onSubmit={(name) => append(
				{ name },
			)}
		/>
		
		<NewItemForm
			buttonId="prepend"
			buttonName="prepend"
			onSubmit={(name) => prepend(
				{ name },
			)}
		/>

		<NewItemForm
			buttonId="update"
			buttonName="update"
			onSubmit={(name) => update(0,
				{ name },
			)}
		/>

		<NewItemForm
			buttonId="insert"
			buttonName="insert"
			onSubmit={(name) => insert(0,
				{ name },
			)}
		/>

		<div id="renderCount">{renderCount}</div>
		<div id="result">{JSON.stringify(data)}</div>
		<div id="dirty">{isDirty ? 'yes' : 'no'}</div>
		<div id="isValid">{isValid ? 'yes' : 'no'}</div>
		<div id="dirtyFields">{JSON.stringify(dirtyFields)}</div>
		<div id="touched">{JSON.stringify(touchedFields.data)}</div>
	</div>
  );
};

export default UseFieldArrayWithExternalRHForm;
