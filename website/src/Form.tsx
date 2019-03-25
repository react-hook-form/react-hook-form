import React from 'react';
import { Title } from './styles/typography';
import colors from './styles/colors';
import { Animate } from 'react-simple-animate';
import styled from 'styled-components';
import Setting from './svgs/setting';

const Code = styled.pre`
  text-align: left;
  padding: 0 20px;
  white-space: pre-wrap;
`;

const Wrapper = styled.div`
  display: grid;
  min-height: 80vh;
  transition: 1s all;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
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

const SettingIcon = styled.button`
  -webkit-appearance: none;
  border: none;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  font-size: 14px;
  right: 0;
  top: 5px;
  z-index: 1;
  padding-left: 10px;
  background: ${colors.primary};
  cursor: pointer;
  
  &:hover {
    transition: 0.3s all;
    color: ${colors.lightPink};
  }

  & > svg {
    fill: white;
    width: 20px;
    margin-right: 5px;
    display: inline-block;
  }
`;

const errorStyle = { border: `1px solid ${colors.secondary}`, background: colors.errorPink };

export default function Form({
  formData,
  handleSubmit,
  onSubmit,
  submitData,
  register,
  errors,
  watch,
  toggleBuilder,
  setting,
  showSetting,
  toggleSetting,
}) {
  return (
    <>
      <Wrapper>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Title>
            Example{' '}
            <SettingIcon onClick={() => toggleSetting(!showSetting)}>
              <Setting />
              Setting
            </SettingIcon>
          </Title>
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
                    ref={ref =>
                      // @ts-ignore
                      register({
                        ref,
                        required: field.required,
                        ...(field.pattern ? { pattern: field.pattern } : null),
                        ...(field.max ? { max: field.max } : null),
                        ...(field.min ? { min: field.min } : null),
                        ...(field.maxLength ? { maxLength: field.maxLength } : null),
                        ...(field.minLength ? { minLength: field.minLength } : null),
                      })
                    }
                  />
                );
            }
          })}

          <SubmitButton type="submit" value="Submit" className="App-submit" />

          <Title
            style={{
              fontSize: 14,
              maxWidth: '80%',
              margin: '20px auto 0',
            }}
          >
            or
          </Title>

          <SubmitButton
            type="button"
            value="Edit"
            onClick={() => {
              toggleBuilder(true);
              document.title = 'React hook form - Builder';
              window.history.pushState({ page: 'React hook form - Builder' }, 'React hook form - Builder', '/builder');
            }}
            style={{
              background: 'black',
              marginTop: 20,
              color: 'white',
            }}
          />
        </form>

        {setting.showError && (
          <section>
            <Title>Errors</Title>
            {!Object.keys(errors).length && <p>ⓘ Press submit to trigger validation error.</p>}
            <Animate
              durationSeconds={0.8}
              play={Object.keys(errors).length}
              startStyle={{ opacity: 0 }}
              endStyle={{ opacity: 1 }}
            >
              <Code>{Object.keys(errors).length ? JSON.stringify(errors, null, 2) : ''}</Code>
            </Animate>
          </section>
        )}

        {setting.showWatch &&
          setting.mode !== 'onSubmit' && (
            <section>
              <Title>Watch</Title>
              {!Object.keys(watch() || {}).length && <p>ⓘ Change input value to see watched values.</p>}
              <Animate
                durationSeconds={0.8}
                play={Object.keys(watch() || {}).length > 0}
                startStyle={{ opacity: 0 }}
                endStyle={{ opacity: 1 }}
              >
                <Code>{JSON.stringify(watch(), null, 2)}</Code>
              </Animate>
            </section>
          )}

        {setting.showSubmit && (
          <section>
            <Title>Submit</Title>
            {!Object.keys(submitData).length && <p>ⓘ Successful submission values will display here.</p>}
            <Animate
              durationSeconds={0.8}
              play={Object.keys(submitData).length}
              startStyle={{ opacity: 0 }}
              endStyle={{ opacity: 1 }}
            >
              <Code>{Object.keys(submitData).length ? JSON.stringify(submitData, null, 2) : ''}</Code>
            </Animate>
          </section>
        )}
      </Wrapper>
    </>
  );
}
