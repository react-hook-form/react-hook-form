import React from 'react';
import useForm from './src';
import './Setting.css';

export default function Setting({ style, toggleSetting }) {
  const { register, prepareSubmit } = useForm();
  const onSubmit = data => {
    toggleSetting(false);
  };

  return (
    <div className="Setting" style={style}>
      <span
        style={{
          position: 'absolute',
          fontSize: 35,
          padding: 20,
          right: 20,
          top: 15,
          cursor: 'pointer',
          fontWeight: 200
        }}
        tabIndex={0}
        onClick={() => toggleSetting(false)}
      >
        &#10005;
      </span>
      <h2 className="Setting-h2">Setting</h2>

      <h2 className="Setting-h3">️Form config</h2>
      <form onSubmit={prepareSubmit(onSubmit)}>
        <div
          style={{
            marginBottom: '30px',
          }}
        >
          <p>Mode: How is the form validation behave</p>

          <select name="mode" ref={ref => register({ ref })} className="Setting-select">
            <option value="onSubmit">validation on submit</option>
            <option value="onChange">validation on change</option>
            <option value="onBlur">validation on blur</option>
          </select>
        </div>

        <h2 className="Setting-h3">Display columns</h2>
        <div>
          <label className="Setting-label">
            <input name="errors" className="Setting-styled-checkbox" type="checkbox" ref={ref => register({ ref })} />
            Errors
          </label>
        </div>

        <div>
          <label className="Setting-label">
            <input name="watch" className="Setting-styled-checkbox" type="checkbox" ref={ref => register({ ref })} />
            Watch
          </label>
        </div>

        <div>
          <label className="Setting-label">
            <input
              name="prepare submit"
              className="Setting-styled-checkbox"
              type="checkbox"
              ref={ref => register({ ref })}
            />
            Prepare Submit
          </label>
        </div>

        <input type="submit" value="Update" className="Setting-submit" />
      </form>
    </div>
  );
}
