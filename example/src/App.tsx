import React, { useState, useRef } from 'react';
import useForm from './src';
import Setting from './Setting';
import { Animate } from 'react-simple-animate';
import Builder from './Builder';
import './App.css';
import ButtonGroup from './ButtonGroup';
import styled from 'styled-components';
import FORM_DATA from './constants/formData';

const Footer = styled.footer`
  padding: 40px 0;
  font-size: 20px;
  font-weight: 200;

  & > a {
    color: white;
    text-decoration: none;
  }
`;

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
    <div className="App">
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
      <Animate
        play={showBuilder || showSetting}
        startStyle={{ minHeight: '100vh', filter: 'blur(0)', transform: 'scale(1)' }}
        endStyle={{ minHeight: '100vh', filter: 'blur(3px)', transform: 'scale(0.9)' }}
      >
        <h1 className="App-h1">React Forme</h1>
        <p className="App-sub-heading">
          Performance, flexible and extensible forms with easy to use feedback for validation.
        </p>

        <ButtonGroup
          toggleBuilder={toggleBuilder}
          toggleSetting={toggleSetting}
          showSetting={showSetting}
          settingButton={settingButton}
        />

        <div
          style={{
            display: 'grid',
            transition: '1s all',
            gridTemplateColumns: `repeat(${Object.values(setting).filter(Boolean).length}, 1fr)`,
            gridColumnGap: '25px',
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <code>
              <h2 className="App-h2">Form</h2>
            </code>
            {formData.map(field => {
              switch (field.type) {
                case 'select':
                  return (
                    <select
                      name={field.name}
                      ref={ref => register({ ref })}
                      key={field.name}
                      style={{ marginBottom: 20 }}
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
                    <div className="App-radio-group" key={field.name} style={{ marginBottom: 20 }}>
                      {field.options &&
                        field.options
                          .split(';')
                          .filter(Boolean)
                          .map(name => {
                            return (
                              <label key={name}>
                                {name}
                                &nbsp;
                                <input type="radio" name={field.name} value={name} ref={ref => register({ ref })} />
                              </label>
                            );
                          })}
                    </div>
                  );
                default:
                  return (
                    <input
                      style={{ marginBottom: 20 }}
                      key={field.name}
                      type={field.type}
                      name={field.name}
                      placeholder={field.name}
                      ref={ref => register({ ref })}
                    />
                  );
              }
            })}

            <input type="submit" value="Submit" className="App-submit" />
          </form>

          {setting.showError && (
            <code>
              <h2 className="App-h2">Errors</h2>
              <pre
                style={{
                  textAlign: 'left',
                  padding: '0 20px',
                }}
              >
                {Object.keys(errors).length ? JSON.stringify(errors, null, 2) : ''}
              </pre>
            </code>
          )}

          {setting.showWatch && (
            <code>
              <h2 className="App-h2">Watch</h2>
              <pre
                style={{
                  textAlign: 'left',
                  padding: '0 20px',
                }}
              >
                {JSON.stringify(watch(), null, 2)}
              </pre>
            </code>
          )}

          {setting.showSubmit && (
            <code>
              <h2 className="App-h2">Submit</h2>
              <pre
                style={{
                  textAlign: 'left',
                  padding: '0 20px',
                }}
              >
                {Object.keys(submitData).length ? JSON.stringify(submitData, null, 2) : ''}
              </pre>
            </code>
          )}
        </div>

        <Footer>
          Build ♡ by <a href="https://twitter.com/bluebill1049">@Bill Luo</a> &{' '}
          <a href="https://react-forme.now.sh/" target="_blank">
            React Forme
          </a>{' '}
          +{' '}
          <a href="https://react-simple-animate.now.sh/" target="_blank">
            React Simple Animate
          </a>
        </Footer>
      </Animate>
    </div>
  );
}

export default App;
