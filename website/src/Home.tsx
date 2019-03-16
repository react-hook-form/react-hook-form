import React from 'react';
import { Heading, SubHeading, Title } from './styles/typography';
import colors from './styles/colors';
import { Animate } from 'react-simple-animate';
import styled from 'styled-components';

const Logo = styled.svg`
  fill: white;
  height: 25px;
  top: 0;
  left: 0;
  background: #333;
  padding: 5px;
  border-radius: 8px;
  margin-right: 10px;
  margin-bottom: -5px;
  background: ${colors.lightPink};

  @media (min-width: 1024px) {
    height: 45px;
    margin-bottom: -10px;
    margin-right: 20px;
    border-radius: 12px;
  }
`;

const Code = styled.pre`
  text-align: left;
  padding: 0 20px;
  white-space: pre-wrap;
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

export default function Home({
  formData,
  handleSubmit,
  onSubmit,
  submitData,
  register,
  errors,
  watch,
  toggleBuilder,
  setting,
}) {
  return (
    <>
      <Wrapper>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Title>Form</Title>
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
              marginTop: 30,
              fontSize: 14,
            }}
          >
            or
          </Title>

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
