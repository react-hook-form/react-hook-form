import React, { useState, useRef } from 'react';
import useForm from './src';
import Setting from './Setting';
import { Animate } from 'react-simple-animate';
import Builder from './Builder';
import './App.css';
import ButtonGroup from './ButtonGroup';

function App() {
  const [submitData, updateSubmitData] = useState({});
  const settingButton = useRef(null);
  const [editFormData, setFormData] = useState({});
  const [showSetting, toggleSetting] = useState(false);
  const [showBuilder, toggleBuilder] = useState(false);
  const [setting, setConfig] = useState({
    mode: 'onChange',
    showError: true,
    showWatch: true,
    showSubmit: true,
  });
  // @ts-ignore
  const { register, errors, prepareSubmit, watch } = useForm({
    mode: setting.mode,
  });

  const onSubmit = (data) => {
    updateSubmitData(data);
  };

  return (
    <div className="App">
      <Builder
        showBuilder={!showBuilder}
        toggleBuilder={toggleBuilder}
        editFormData={editFormData}
        setFormData={setFormData}
      />
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
          <Setting
            settingButton={settingButton}
            toggleSetting={toggleSetting}
            setting={setting}
            showSetting={showSetting}
            setConfig={setConfig}
            style={style}
          />
        )}
      />
      <Animate play={showBuilder || showSetting} startStyle={{ filter: 'blur(0)' }} endStyle={{ filter: 'blur(3px)' }}>
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
          <form onSubmit={prepareSubmit(onSubmit)}>
            <code>
              <h2 className="App-h2">Form</h2>
            </code>
            <input name="input" placeholder="input" ref={ref => register({ ref })} />
            <input type="range" name="range" ref={ref => register({ ref })} />
            <input
              type="regex"
              name="regex"
              placeholder="regex"
              ref={ref =>
                register({
                  ref,
                  pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                })
              }
            />
            <input type="date" name="date" ref={ref => register({ ref, required: true })} />
            <input type="datetime-local" name="datetime-local" ref={ref => register({ ref, required: true })} />
            <input type="email" placeholder="email" name="email" ref={ref => register({ ref, required: true })} />
            <input name="inputRequired" placeholder="input required" ref={ref => register({ ref, required: true })} />
            <input
              name="inputMaxLength"
              placeholder="max 8"
              ref={ref => register({ ref, required: true, maxLength: 8 })}
            />
            <input
              type="number"
              name="number"
              placeholder="max 250 min 20"
              ref={ref => register({ ref, required: true, max: 250, min: 20 })}
            />

            <select name="select" ref={ref => register({ ref, required: true })}>
              <option value="">select</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>

            <select name="selectMultiple" multiple ref={ref => register({ ref, required: true })}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>

            <div className="App-radio-group">
              <label>
                Option 1: <input type="radio" name="radio" value={1} ref={ref => register({ ref, required: true })} />
              </label>
              <label>
                Option 2: <input type="radio" name="radio" value={2} ref={ref => register({ ref, required: true })} />
              </label>
            </div>

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
      </Animate>
    </div>
  );
}

export default App;
