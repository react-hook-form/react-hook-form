// @flow
import React, { useState } from 'react';
import './Builder.css';
import { Animate } from 'react-simple-animate';
import SyntaxHighlighter from 'react-syntax-highlighter';
import useForm from './src';
import { monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const code = formData => {
  return `import React from 'react';
import useForm from 'react-forme';

function Form() {
  const { register, prepareSubmit } = useForm();
  const onSubmit = data => console.log(data);
  
  return (
    <form onSubmit={prepareSubmit(onSubmit)}>
${formData.reduce((previous, { type, name, required, max, min, maxLength, minLength, pattern, options }, index) => {
    const ref = ` ref={ref => register({ ref${required ? ', required: true' : ''}})}`;
    
    console.log(options);
    
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
  }, '')}
      <input type="submit" />
    </form>
  );
}`;
}

export default function Builder({ showBuilder, toggleBuilder }) {
  const { register, prepareSubmit, errors, watch } = useForm();
  const [formData, updateFormData] = useState([]);
  const [showValidation, toggleValidation] = useState(false);
  const onSubmit = (data, event) => {
    console.log(formData);
    updateFormData([...formData, ...[data]]);
    console.log(data);
    event.target.reset();
  };
  const type = watch('type');

  return (
    <Animate
      play={showBuilder}
      durationSeconds={0}
      type="ease-in"
      startStyle={{
        transform: 'translateY(100%)'
      }}
      endStyle={{
        transform: 'translateY(0)',
      }}
      render={({ style }) => {
        return (
          <div style={style} className="Builder">
            <div
              style={{
                overflow: 'auto',
                height: '100vh',
              }}
            >
              <button
                style={{
                  position: 'absolute',
                  fontSize: 35,
                  padding: 20,
                  right: 20,
                  top: 10,
                  background: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  border: 'none',
                  fontWeight: 200,
                }}
                // ref={buttonRef}
                tabIndex={0}
                onClick={() => {
                  // settingButton.current.focus();
                  toggleBuilder(false);
                }}
              >
                &#10005;
              </button>
              <h1 className="App-h1">Builder</h1>
              <p className="App-sub-heading">Build your own form with code and example</p>

              <div className="Builder-wrapper">
                <div
                  style={{
                    paddingLeft: '20px',
                  }}
                >
                  <h2 className="Builder-h2">Form</h2>
                </div>

                <form className="Builder-form" onSubmit={prepareSubmit(onSubmit)}>
                  <h2 className="Builder-h2">Builder</h2>

                  <label>Name: </label>
                  <input
                    className={errors.name && 'form-error'}
                    name="name"
                    ref={ref => register({ ref, required: true })}
                  />
                  {errors.name && <p className="form-error-msg">This is required</p>}

                  <label>Type: </label>
                  <select name="type" ref={ref => register({ ref })}>
                    <option value="text">Text</option>
                    <option value="select">Select</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="radio">Radio</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                    <option value="range">Range</option>
                    <option value="search">Search</option>
                    <option value="tel">Tel</option>
                    <option value="url">url</option>
                    <option value="time">Time</option>
                    <option value="datetime">datetime</option>
                    <option value="datetime-local">datetime-local</option>
                    <option value="week">week</option>
                    <option value="month">month</option>
                  </select>

                  {(type === 'select' || type === 'radio') && (
                    <>
                      <label>Options:</label>
                      <input
                        type="text"
                        name="options"
                        placeholder="Enter options separate by ;"
                        ref={ref => register({ ref })}
                      />
                    </>
                  )}

                  <label>
                    <input type="checkbox" onClick={() => toggleValidation(!showValidation)} />
                    &nbsp; Toggle Validation Panel
                  </label>

                  {showValidation && (
                    <>
                      <label>Validation</label>
                      <fieldset>
                        <label>
                          <input type="checkbox" name="required" ref={ref => register({ ref })} /> required
                        </label>
                        <label>Max</label>
                        <input name="max" type="number" ref={ref => register({ ref })} />
                        <label>Min</label>
                        <input name="min" type="number" ref={ref => register({ ref })} />
                        <label>MaxLength</label>
                        <input name="maxLength" type="number" ref={ref => register({ ref })} />
                        <label>MinLength</label>
                        <input name="minLength" type="number" ref={ref => register({ ref })} />
                        <label>Pattern</label>
                        <input name="pattern" type="text" ref={ref => register({ ref })} />
                      </fieldset>
                    </>
                  )}

                  <input type="submit" value="Insert" className="Builder-form-submit" />
                </form>

                <div
                  style={{
                    paddingRight: '20px',
                  }}
                >
                  <h2 className="Builder-h2">Code</h2>

                  <SyntaxHighlighter style={monokai}>{code(formData)}</SyntaxHighlighter>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
