import React, { useRef } from 'react';
import { Animate } from 'react-simple-animate';
import styled from 'styled-components';
import useForm from './src';
import colors from './styles/colors';

const Root = styled.div`
  background: ${colors.secondary};
  position: fixed;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 3;
  width: 20%;
  text-align: left;
  box-shadow: 5px 0px 9px 0px ${colors.primary};
  padding: 20px;
  min-width: 260px;

  & > button {
    color: white;
  }
`;

function Setting({ settingButton, toggleSetting, showSetting, setting, setConfig }) {
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
        transform: 'translateX(-600px)',
      }}
      render={({ style }) => (
        <Root style={style}>
          <button
            style={{
              position: 'absolute',
              fontSize: 35,
              padding: 20,
              right: 20,
              top: 15,
              background: 'none',
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
          <h2
            style={{
              fontSize: 40,
              fontWeight: 200,
              marginTop: 10,
            }}
          >
            Setting
          </h2>

          <h2
            style={{
              fontSize: 20,
              fontWeight: 500,
              marginTop: 10,
            }}
          >
            ️Form config
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div
              style={{
                marginBottom: '30px',
              }}
            >
              <p>When to trigger validation?</p>

              <select
                name="mode"
                style={{
                  height: 37,
                  fontSize: 16,
                  width: '100%',
                }}
                ref={ref => register({ ref })}
                defaultValue={setting.mode}
              >
                {[
                  {
                    value: 'onSubmit',
                    name: 'on submit',
                  },
                  {
                    value: 'onChange',
                    name: 'on change',
                  },
                  {
                    value: 'onBlur',
                    name: 'on blur',
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

            <h2
              style={{
                fontSize: 20,
                fontWeight: 500,
                marginTop: 10,
              }}
            >
              Display columns
            </h2>
            <label
              style={{
                marginBottom: 10,
                display: 'block',
              }}
            >
              <input
                name="showError"
                type="checkbox"
                style={{
                  marginRight: 10,
                }}
                ref={ref => register({ ref })}
                defaultChecked={setting.showError}
              />
              Errors
            </label>

            <label
              style={{
                marginBottom: 10,
                display: 'block',
              }}
            >
              <input
                name="showWatch"
                type="checkbox"
                style={{
                  marginRight: 10,
                }}
                ref={ref => register({ ref })}
                defaultChecked={setting.showWatch}
              />
              Watch
            </label>

            <label
              style={{
                marginBottom: 10,
                display: 'block',
              }}
            >
              <input
                name="showSubmit"
                type="checkbox"
                style={{
                  marginRight: 10,
                }}
                defaultChecked={setting.showSubmit}
                ref={ref => register({ ref })}
              />
              Prepare Submit
            </label>

            <input
              style={{
                marginTop: 30,
                height: 55,
                textTransform: 'uppercase',
                letterSpacing: '0.5rem',
                background: 'white',
              }}
              type="submit"
              value="Update"
            />
          </form>
        </Root>
      )}
    />
  );
}

export default React.memo(Setting);
