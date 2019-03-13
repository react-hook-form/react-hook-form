import React, { useRef } from 'react';
import { Animate } from 'react-simple-animate';
import useForm from './src';
import './Setting.css';

function Setting({ settingButton, toggleSetting, showSetting, setting, setConfig }) {
  return null;
  const buttonRef = useRef(null);
  const { register, handleSubmit } = useForm();
  const onSubmit = data => {
    setConfig(data);
    toggleSetting(false);
    settingButton.current.focus();
  };

  if (showSetting && buttonRef.current) {
    // @ts-ignore
    buttonRef.current.focus();
  }

  return (
    <Animate
      play={showSetting}
      easeType="ease-in"
      endStyle={{
        transform: 'translateX(0)',
      }}
      startStyle={{
        pointerEvents: 'none',
        transform: 'translateX(600px)',
      }}
      render={({ style }) => (
        <div className="Setting" style={style}>
          <button
            style={{
              position: 'absolute',
              fontSize: 35,
              padding: 20,
              right: 0,
              top: 15,
              background: 'none',
              color: 'white',
              cursor: 'pointer',
              border: 'none',
              fontWeight: 200,
            }}
            ref={buttonRef}
            tabIndex={0}
            onClick={() => {
              settingButton.current.focus();
              toggleSetting(false);
            }}
          >
            &#10005;
          </button>
          <h2 className="Setting-h2">Setting</h2>

          <h2 className="Setting-h3">️Form config</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div
              style={{
                marginBottom: '30px',
              }}
            >
              <p>Mode: How is the form validation behave</p>

              <select name="mode" ref={ref => register({ ref })} className="Setting-select" defaultValue={setting.mode}>
                {[
                  {
                    value: 'onSubmit',
                    name: 'validation on submit',
                  },
                  {
                    value: 'onChange',
                    name: 'validation on change',
                  },
                  {
                    value: 'onBlur',
                    name: 'validation on blur',
                  },
                ].map(({ value, name }) => {
                  return (
                    <option key={name} value={value}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>

            <h2 className="Setting-h3">Display columns</h2>
            <div>
              <label className="Setting-label">
                <input
                  name="showError"
                  className="Setting-styled-checkbox"
                  type="checkbox"
                  ref={ref => register({ ref })}
                  defaultChecked={setting.showError}
                />
                Errors
              </label>
            </div>

            <div>
              <label className="Setting-label">
                <input
                  name="showWatch"
                  className="Setting-styled-checkbox"
                  type="checkbox"
                  ref={ref => register({ ref })}
                  defaultChecked={setting.showWatch}
                />
                Watch
              </label>
            </div>

            <div>
              <label className="Setting-label">
                <input
                  name="showSubmit"
                  className="Setting-styled-checkbox"
                  type="checkbox"
                  defaultChecked={setting.showSubmit}
                  ref={ref => register({ ref })}
                />
                Prepare Submit
              </label>
            </div>

            <input type="submit" value="Update" className="Setting-submit" />
          </form>
        </div>
      )}
    />
  );
}

export default React.memo(Setting);
