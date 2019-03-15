import React, { useState, useRef } from 'react';
import useForm from './src';
import Setting from './Setting';
import { Animate } from 'react-simple-animate';
import Builder from './Builder';
import './App.css';
import ButtonGroup from './ButtonGroup';
import styled from 'styled-components';
import FORM_DATA from './constants/formData';
import colors from './styles/colors';

const Root = styled.div`
  overflow: hidden;
  color: white;
  padding: 0 50px;
  position: relative;

  & form > select,
  & form > input {
    display: block;
    box-sizing: border-box;
    width: 100%;
    border-radius: 4px;
    padding: 10px 15px;
    margin-bottom: 10px;
    font-size: 16px;
  }

  & form > select {
    width: 100%;
  }

  & form > select:not([multiple]) {
    height: 37px;
  }

  & form {
    flex: 1;
  }

  & form > input.form-error {
    border: 1px solid #bf1650;
  }
`;

const Footer = styled.footer`
  padding: 40px 0;
  font-size: 16px;
  font-weight: 200;

  & > a {
    color: white;
    text-decoration: none;
    transition: 0.3s all;

    &:hover {
      color: ${colors.lightPink};
    }
  }
`;

const Pre = styled.pre`
  text-align: left;
  padding: 0 20px;
`;

const Logo = styled.svg`
  height: 45px;
  fill: white;
  top: 0;
  left: 0;
  background: #333;
  padding: 9px;
  border-radius: 12px;
  margin-bottom: -10px;
  margin-right: 20px;
  background: ${colors.lightPink};
`;

const Wrapper = styled.div`
  display: grid;
  min-height: 80vh;
  transition: 1s all;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  grid-column-gap: 40px;
`;

const SubmitButton = styled.input`
  background: ${colors.lightPink};
  height: 55px;
  color: white;
  letter-spacing: 0.5rem;
  text-transform: uppercase;
  width: 100%;
  padding: 20px;
  font-size: 16px;
  border: 1px solid transparent;
`;

const RadioGroup = styled.div`
  display: flex;
  margin-bottom: 20px;

  & > label:first-child {
    margin-right: 20px;
  }
`;

const errorStyle = { border: `1px solid ${colors.secondary}`, background: colors.errorPink };

function App() {
  const [submitData, updateSubmitData] = useState({});
  const settingButton = useRef(null);
  const [editFormData, setFormData] = useState({});
  const [showSetting, toggleSetting] = useState(false);
  const [showBuilder, toggleBuilder] = useState(false);
  const [formData, updateFormData] = useState(FORM_DATA);
  const [setting, setConfig] = useState<{
    mode: 'onSubmit' | 'onBlur' | 'onChange';
    showError: boolean;
    showWatch: boolean;
    showSubmit: boolean;
  }>({
    mode: 'onChange',
    showError: true,
    showWatch: true,
    showSubmit: true,
  });
  const { register, errors, handleSubmit, watch } = useForm({
    mode: setting.mode,
  });

  const onSubmit = data => {
    updateSubmitData(data);
  };

  return (
    <Root>
      <Builder
        showBuilder={showBuilder}
        toggleBuilder={toggleBuilder}
        editFormData={editFormData}
        setFormData={setFormData}
        formData={formData}
        updateFormData={updateFormData}
      />
      <Setting
        settingButton={settingButton}
        toggleSetting={toggleSetting}
        setting={setting}
        showSetting={showSetting}
        setConfig={setConfig}
      />
      <main
        style={{
          perspective: '800px',
        }}
      >
        <Animate
          play={showBuilder || showSetting}
          startStyle={{ minHeight: '100vh', filter: 'blur(0)', transform: 'scale(1)' }}
          endStyle={{ minHeight: '100vh', filter: 'blur(3px)', transform: 'scale(0.9) rotateX(5deg)' }}
        >
          <h1 className="App-h1">
            <Logo viewBox="0 0 100 100">
              <title>118all</title>
              <path d="M73.56,13.32H58.14a8.54,8.54,0,0,0-16.27,0H26.44a11,11,0,0,0-11,11V81.63a11,11,0,0,0,11,11H73.56a11,11,0,0,0,11-11V24.32A11,11,0,0,0,73.56,13.32Zm-30.92,2a1,1,0,0,0,1-.79,6.54,6.54,0,0,1,12.78,0,1,1,0,0,0,1,.79h5.38v6.55a3,3,0,0,1-3,3H40.25a3,3,0,0,1-3-3V15.32ZM82.56,81.63a9,9,0,0,1-9,9H26.44a9,9,0,0,1-9-9V24.32a9,9,0,0,1,9-9h8.81v6.55a5,5,0,0,0,5,5h19.5a5,5,0,0,0,5-5V15.32h8.81a9,9,0,0,1,9,9Z" />
              <path style={{ transform: 'translateX(-25px)' }} d="M71.6,45.92H54a1,1,0,0,0,0,2H71.6a1,1,0,0,0,0-2Z" />
              <path d="M71.6,45.92H54a1,1,0,0,0,0,2H71.6a1,1,0,0,0,0-2Z" />
              <path
                style={{ transform: 'translateX(-25px)' }}
                d="M71.1,69.49H53.45a1,1,0,1,0,0,2H71.1a1,1,0,0,0,0-2Z"
              />
              <path d="M71.1,69.49H53.45a1,1,0,1,0,0,2H71.1a1,1,0,0,0,0-2Z" />
            </Logo>
            React Forme
          </h1>
          <p className="App-sub-heading">
            Performance, flexible and extensible forms with easy to use feedback for validation.
          </p>

          <ButtonGroup
            toggleBuilder={toggleBuilder}
            toggleSetting={toggleSetting}
            showSetting={showSetting}
            settingButton={settingButton}
          />

          <Wrapper>
            <form onSubmit={handleSubmit(onSubmit)}>
              <h2 className="App-h2">Form</h2>
              {formData.map(field => {
                switch (field.type) {
                  case 'select':
                    return (
                      <select
                        name={field.name}
                        ref={ref => register({ ref, required: field.required })}
                        key={field.name}
                        style={{
                          marginBottom: 20,
                          ...(errors[field.name] ? errorStyle : null),
                        }}
                      >
                        <option value="">Select...</option>
                        {field.options &&
                          field.options
                            .split(';')
                            .filter(Boolean)
                            .map(option => {
                              return <option key={option}>{option}</option>;
                            })}
                      </select>
                    );
                  case 'radio':
                    return (
                      <RadioGroup key={field.name} style={{ marginBottom: 20 }}>
                        {field.options &&
                          field.options
                            .split(';')
                            .filter(Boolean)
                            .map(name => {
                              return (
                                <label
                                  key={name}
                                  style={{
                                    ...(errors[field.name] ? { color: colors.lightPink } : null),
                                  }}
                                >
                                  {name}
                                  &nbsp;
                                  <input
                                    type="radio"
                                    name={field.name}
                                    value={name}
                                    ref={ref => register({ ref, required: field.required })}
                                  />
                                </label>
                              );
                            })}
                      </RadioGroup>
                    );
                  default:
                    return (
                      <input
                        style={{
                          marginBottom: 20,
                          ...(errors[field.name] ? errorStyle : null),
                        }}
                        autoComplete="off"
                        key={field.name}
                        type={field.type}
                        name={field.name}
                        placeholder={field.name}
                        ref={ref => register({ ref, required: field.required })}
                      />
                    );
                }
              })}

              <SubmitButton type="submit" value="Submit" className="App-submit" />

              <h2
                className="Builder-h2"
                style={{
                  marginTop: 30,
                  fontSize: 14,
                }}
              >
                or
              </h2>

              <SubmitButton
                type="button"
                value="Edit"
                onClick={() => toggleBuilder(true)}
                style={{
                  background: 'black',
                  marginTop: 20,
                  color: 'white',
                }}
              />
            </form>

            {setting.showError && (
              <section>
                <h2 className="App-h2">Errors</h2>
                {!Object.keys(errors).length && <p>ⓘ Press submit to trigger validation error.</p>}
                <Animate play={Object.keys(errors).length} startStyle={{ opacity: 0 }} endStyle={{ opacity: 1 }}>
                  <Pre>{Object.keys(errors).length ? JSON.stringify(errors, null, 2) : ''}</Pre>
                </Animate>
              </section>
            )}

            {setting.showWatch &&
              setting.mode !== 'onSubmit' && (
                <section>
                  <h2 className="App-h2">Watch</h2>
                  {!Object.keys(watch() || {}).length && <p>ⓘ Change input value to see watched values.</p>}
                  <Animate
                    play={Object.keys(watch() || {}).length > 0}
                    startStyle={{ opacity: 0 }}
                    endStyle={{ opacity: 1 }}
                  >
                    <pre>{JSON.stringify(watch(), null, 2)}</pre>
                  </Animate>
                </section>
              )}

            {setting.showSubmit && (
              <section>
                <h2 className="App-h2">Submit</h2>
                {!Object.keys(submitData).length && <p>ⓘ Successful submission values will display here.</p>}
                <Animate
                  play={Object.keys(submitData).length}
                  startStyle={{ opacity: 0 }}
                  endStyle={{ opacity: 1 }}
                >
                  <Pre>{Object.keys(submitData).length ? JSON.stringify(submitData, null, 2) : ''}</Pre>
                </Animate>
              </section>
            )}
          </Wrapper>

          <Footer>
            Build ♡ by <a href="https://twitter.com/bluebill1049">@Bill Luo</a> with{' '}
            <a href="https://react-forme.now.sh/" target="_blank">
              React Forme
            </a>{' '}
            &{' '}
            <a href="https://react-simple-animate.now.sh/" target="_blank">
              React Simple Animate
            </a>
          </Footer>
        </Animate>
      </main>
    </Root>
  );
}

export default React.memo(App);
