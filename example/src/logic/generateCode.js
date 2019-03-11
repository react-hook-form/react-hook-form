export default formData => {
  return `import React from 'react';
import useForm from 'react-forme';

function Form() {
  const { register, handleSubmit } = useForm();
  const onSubmit = data => console.log(data);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
${Array.isArray(formData) ? formData.reduce((previous, { type, name, required, max, min, maxLength, minLength, pattern, options }, index) => {
    const ref = ` ref={ref => register({ ref${required ? ', required: true' : ''} })}`;

    if (type === 'select') {
      const select = `      <select name="${name}"${ref}>\n${options.split(';').filter(Boolean).reduce((temp, option) => {
        return temp + `        <option value="${option}">${option}</option>\n`;
      }, '')}      </select>\n`;

      return previous + select;
    }

    if (type === 'radio') {
      const select = `\n${options.split(';').filter(Boolean).reduce((temp, option) => {
        return temp + `        <input type="${type}" value="${option}"${ref}/>\n`;
      }, '')}\n`;

      return previous + select;
    }

    return (
      previous +
      `      <input type="${type}" name="${name}" ref={ref => register({ ref${
        required ? ', required: true' : ''
        }${max ? `, max: ${max}` : ''}${minLength ? `, minLength: ${minLength}` : ''}${
        minLength ? `, maxLength: ${maxLength}` : ''
        }${pattern ? `, pattern: /${pattern}/` : ''}${min ? `, min: ${min}` : ''} })} />\n`
    );
  }, '') : ''}
      <input type="submit" />
    </form>
  );
}`;
};
