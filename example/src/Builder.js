// @flow
import React from 'react';
import './Builder.css';
import { Animate } from 'react-simple-animate';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const code = `import React from 'react';
import useForm from 'react-forme';

function Form() {
  const { register } = useForm();
  return <form>
    <input type="submit" />
  </form>
}`;

export default function Builder({ showBuilder }) {
  return (
    <Animate
      play={showBuilder}
      durationSeconds={0.8}
      type="ease-in"
      startStyle={{
        transform: 'translateX(-100%)'
      }}
      endStyle={{
        transform: 'translateY(0)'
      }}
      render={({style}) => {
        return (
          <div style={style} className="Builder">
            <h1 className="App-h1">React Forme Builder</h1>
            <p
              style={{
                marginBottom: '40px',
                color: '#ec5990',
              }}
            >
              Build your own form with code and example
            </p>

            <div className="Builder-wrapper">
              <div
                style={{
                  paddingLeft: '20px',
                }}
              >
                <h2>Form</h2>
              </div>

              <form className="Builder-form">
                <h2>Builder</h2>

                <label>Name: </label>
                <input />

                <label>Type: </label>
                <select>
                  <option>Select...</option>
                </select>

                <input type="submit" value="Insert" className="Builder-form-submit" />
              </form>

              <div
                style={{
                  paddingRight: '20px',
                }}
              >
                <h2>Code</h2>

                <SyntaxHighlighter style={monokai}>{code}</SyntaxHighlighter>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
