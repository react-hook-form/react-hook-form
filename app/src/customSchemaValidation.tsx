import React from 'react';
import { useForm } from 'react-hook-form';
import Joi from 'joi';

let renderCounter = 0;

const validationSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().max(5).required(),
  min: Joi.number().min(10).required(),
  max: Joi.number().max(20).required(),
  minDate: Joi.date().min('2019-08-01'),
  maxDate: Joi.date().max('2019-08-01'),
  minLength: Joi.string().min(2),
  minRequiredLength: Joi.string().required(),
  selectNumber: Joi.string().required(),
  pattern: Joi.string().required(),
  radio: Joi.string().required(),
  checkbox: Joi.required(),
});

const resolver = async (data: any) => {
  const { error, value: values } = validationSchema.validate(data, {
    abortEarly: false,
  });

  return {
    values: error ? {} : values,
    errors: error
      ? error.details.reduce((previous, { message, type, path }) => {
          return {
            ...previous,
            [path[0]]: {
              message,
              type,
            },
          };
        }, {})
      : {},
  };
};

const BasicSchemaValidation: React.FC = (props: any) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    firstName: string;
    lastName: string;
    min: string;
    max: string;
    minDate: string;
    maxDate: string;
    minLength: string;
    minRequiredLength: string;
    selectNumber: string;
    pattern: string;
    radio: string;
    checkbox: string;
    multiple: string;
    validate: string;
  }>({
    resolver,
    mode: props.match.params.mode,
  });
  const onSubmit = () => {};

  renderCounter++;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        name="firstName"
        {...register('firstName')}
        placeholder="firstName"
      />
      {errors.firstName && <p>firstName error</p>}
      <input name="lastName" {...register('lastName')} placeholder="lastName" />
      {errors.lastName && <p>lastName error</p>}
      <input type="number" name="min" {...register('min')} placeholder="min" />
      {errors.min && <p>min error</p>}
      <input type="number" name="max" {...register('max')} placeholder="max" />
      {errors.max && <p>max error</p>}
      <input
        type="date"
        name="minDate"
        {...register('minDate')}
        placeholder="minDate"
      />
      {errors.minDate && <p>minDate error</p>}
      <input
        type="date"
        name="maxDate"
        {...register('maxDate')}
        placeholder="maxDate"
      />
      {errors.maxDate && <p>maxDate error</p>}
      <input
        name="minLength"
        {...register('minLength')}
        placeholder="minLength"
      />
      {errors.minLength && <p>minLength error</p>}
      <input
        name="minRequiredLength"
        {...register('minRequiredLength')}
        placeholder="minRequiredLength"
      />
      {errors.minRequiredLength && <p>minRequiredLength error</p>}
      <select name="selectNumber" {...register('selectNumber')}>
        <option value="">Select</option>
        <option value={1}>1</option>
        <option value={2}>1</option>
      </select>
      {errors.selectNumber && <p>selectNumber error</p>}
      <input name="pattern" {...register('pattern')} placeholder="pattern" />
      {errors.pattern && <p>pattern error</p>}
      Radio1
      <input type="radio" name="radio" {...register('radio')} value="1" />
      Radio2
      <input type="radio" name="radio" {...register('radio')} value="2" />
      Radio3
      <input type="radio" name="radio" {...register('radio')} value="3" />
      {errors.radio && <p>radio error</p>}
      <input type="checkbox" name="checkbox" {...register('checkbox')} />
      {errors.checkbox && <p>checkbox error</p>}
      <button>Submit</button>
      <div id="renderCount">{renderCounter}</div>
    </form>
  );
};

export default BasicSchemaValidation;
