import React, { useRef } from 'react';
import { Animate } from 'react-simple-animate';
import styled from 'styled-components';
import useForm from 'react-hook-form';
import colors from './styles/colors';

const Root = styled.div`
  background: ${colors.secondary};
  position: fixed;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 12;
  width: 20%;
  padding: 20px;
  text-align: left;
  box-shadow: 5px 0px 9px 0px ${colors.primary};
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
  const tabIndex = showSetting ? 0 : -1;

  if (showSetting && buttonRef.current) {
    // @ts-ignore
    buttonRef.current.focus();
  }

  return (
    <Animate
      play={showSetting}
      easeType="ease-in"
      end={{
        transform: 'translateX(0)',
      }}
      start={{
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
              top: 10,
              background: 'none',
              cursor: 'pointer',
              border: 'none',
              fontWeight: 200,
            }}
            ref={buttonRef}
            tabIndex={tabIndex}
            onClick={() => {
              toggleSetting(false);
            }}
          >
            &#10005;
          </button>
          <h2
            style={{
              fontSize: 34,
              fontWeight: 200,
              marginTop: 10,
            }}
          >
            Demo Setting
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
                aria-label="Select mode"
                name="mode"
                style={{
                  height: 37,
                  fontSize: 16,
                  width: '100%',
                }}
                tabIndex={tabIndex}
                ref={register({ required: true })}
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
              Columns display
            </h2>
            <label
              style={{
                marginBottom: 10,
                display: 'block',
              }}
            >
              <input
                aria-label="Show Error?"
                name="showError"
                type="checkbox"
                style={{
                  marginRight: 10,
                }}
                tabIndex={tabIndex}
                ref={register}
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
                aria-label="Display Watch?"
                name="showWatch"
                type="checkbox"
                style={{
                  marginRight: 10,
                }}
                tabIndex={tabIndex}
                ref={register}
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
                aria-label="Show touched?"
                name="showTouch"
                type="checkbox"
                style={{
                  marginRight: 10,
                }}
                tabIndex={tabIndex}
                defaultChecked={setting.showTouch}
                ref={register}
              />
              Touch
            </label>

            <label
              style={{
                marginBottom: 10,
                display: 'block',
              }}
            >
              <input
                aria-label="Show submit result?"
                name="showSubmit"
                type="checkbox"
                style={{
                  marginRight: 10,
                }}
                tabIndex={tabIndex}
                defaultChecked={setting.showSubmit}
                ref={register}
              />
              Submit
            </label>

            <input
              aria-label="Submit"
              style={{
                marginTop: 30,
                height: 55,
                textTransform: 'uppercase',
                letterSpacing: '0.5rem',
                background: 'white',
              }}
              tabIndex={tabIndex}
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
