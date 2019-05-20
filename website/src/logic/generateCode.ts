export default formData => {
  return `
import React from 'react';
import useForm from 'react-hook-form';

export default function Form() {
  const { register, handleSubmit, errors } = useForm();
  const onSubmit = data => console.log(data);
  console.log(errors);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
${Array.isArray(formData) ? formData.reduce((previous, { type, name, required, max, min, maxLength, minLength, pattern, options }) => {
    const anyAttribute = [required, max, min, maxLength, minLength, pattern].some(Boolean);
    const ref = ` ref={register${anyAttribute ? '({ required: true })' : ''}}`;

    if (type === 'select') {
      const select = `      <select name="${name}"${ref}>\n${options.split(';').filter(Boolean).reduce((temp, option) => {
        return temp + `        <option value="${option}">${option}</option>\n`;
      }, '')}      </select>\n`;

      return previous + select;
    }

    if (type === 'radio') {
      const select = `\n${options.split(';').filter(Boolean).reduce((temp, option) => {
        return temp + `      <input name="${name}" type="${type}" value="${option}"${ref}/>\n`;
      }, '')}\n`;

      return previous + select;
    }
    
    const attributes = anyAttribute ? `({ ${
      required ? 'required: true' : ''
      }${max ? `, max: ${max}` : ''}${minLength ? `, minLength: ${minLength}` : ''}${
      maxLength ? `, maxLength: ${maxLength}` : ''
      }${pattern ? `, pattern: /${pattern}/i` : ''}${min ? `, min: ${min}` : ''} })`: '';

    if (type === 'textarea') {
      const select = `      <textarea name="${name}" ref={register${attributes}} />\n`;
      return previous + select;
    }

    return (
      previous +
      `      <input type="${type}" placeholder="${name}" name="${name}" ref={register${attributes}} />\n`
    );
  }, '') : ''}
      <input type="submit" />
    </form>
  );
}`;
};
