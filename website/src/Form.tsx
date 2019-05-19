import React from 'react';
import { Title, H1 } from './styles/typography';
import colors from './styles/colors';
import { Animate } from 'react-simple-animate';
import styled from 'styled-components';
import Setting from './svgs/setting';
import track from './utils/track';

const Code = styled.pre`
  text-align: left;
  padding: 0 20px;
  white-space: pre-wrap;
`;

const Button = styled.button`
  display: block;
  box-sizing: border-box;
  border-radius: 4px;
  padding: 12px 40px;
  margin: 40px auto;
  font-size: 18px;
  background: ${colors.primary};
  color: white;
  border: 1px solid ${colors.lightBlue};
  transition: 0.3s all;
`;

const Wrapper = styled.div`
  display: grid;
  min-height: 70vh;
  transition: 1s all;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
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
  right: -2px;
  top: 0;
  z-index: 1;
  padding-left: 10px;
  background: #04102e;
  border-radius: 2px;
  cursor: pointer;

  @media (min-width: 768px) {
    top: 5px;
  }

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

const SettingWords = styled.span`
  display: none;

  @media (min-width: 1500px) {
    display: inline-block;
  }
`;

const errorStyle = { border: `1px solid ${colors.secondary}`, background: colors.errorPink, borderLeft: `10px solid ${colors.lightPink}` };

export default function Form({
  tabIndex,
  toggleApi,
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
  touched,
}) {
  return (
    <>
      <div
        style={{
          textAlign: 'center',
        }}
      >
        <H1>Live Demo</H1>
        <p>The following form demonstrate React Hook Form in action, and changing validation mode from setting.</p>
      </div>
      <Wrapper>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Title>
            Example{' '}
            <SettingIcon aria-label="Demo form setting" tabIndex={tabIndex} onClick={() => toggleSetting(!showSetting)}>
              <Setting />
              <SettingWords>Setting</SettingWords>
            </SettingIcon>
          </Title>
          {formData.map(field => {
            switch (field.type) {
              case 'select':
                return (
                  <select
                    aria-label={field.name}
                    tabIndex={tabIndex}
                    name={field.name}
                    ref={register({ required: field.required })}
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
              case 'textarea':
                return (
                  <textarea
                    aria-label={field.name}
                    tabIndex={tabIndex}
                    name={field.name}
                    placeholder={field.name}
                    ref={register({
                      required: field.required,
                      ...(field.maxLength ? { maxLength: field.maxLength } : null),
                      ...(field.minLength ? { minLength: field.minLength } : null),
                    })}
                    key={field.name}
                    style={{
                      marginBottom: 20,
                      ...(errors[field.name] ? errorStyle : null),
                    }}
                  />
                );
              case 'radio':
                return (
                  <RadioGroup key={field.name} style={{ marginBottom: 20 }} aria-label={field.name}>
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
                                tabIndex={tabIndex}
                                type="radio"
                                name={field.name}
                                value={name}
                                ref={register({ required: field.required })}
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
                    aria-label={field.name}
                    autoComplete="off"
                    key={field.name}
                    type={field.type}
                    tabIndex={tabIndex}
                    name={field.name}
                    placeholder={field.name}
                    ref={register({
                      required: field.required,
                      ...(field.pattern ? { pattern: new RegExp(field.pattern) } : null),
                      ...(field.max ? { max: field.max } : null),
                      ...(field.min ? { min: field.min } : null),
                      ...(field.maxLength ? { maxLength: field.maxLength } : null),
                      ...(field.minLength ? { minLength: field.minLength } : null),
                    })}
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
            tabIndex={tabIndex}
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
            <Animate duration={0.8} play={!!Object.keys(errors).length} start={{ opacity: 0 }} end={{ opacity: 1 }}>
              <Code>
                {Object.keys(errors).length
                  ? JSON.stringify(
                      // @ts-ignore
                      Object.entries(errors).reduce((previous, [key, { ref, ...rest }]) => {
                        previous[key] = rest;
                        return previous;
                      }, {}),
                      null,
                      2,
                    )
                  : ''}
              </Code>
            </Animate>
          </section>
        )}

        {setting.showWatch && setting.mode === 'onChange' && (
          <section>
            <Title>Watch</Title>
            {!Object.keys(watch() || {}).length && <p>ⓘ Change input value to see watched values.</p>}
            <Animate
              duration={0.8}
              play={Object.keys(watch() || {}).length > 0}
              start={{ opacity: 0 }}
              end={{ opacity: 1 }}
            >
              <Code>{JSON.stringify(watch(), null, 2)}</Code>
            </Animate>
          </section>
        )}

        {setting.showTouch && (
          <section>
            <Title>Touched</Title>
            {!Object.keys(touched).length && <p>ⓘ Touched fields will display here.</p>}
            <Animate duration={0.8} play={touched.length} start={{ opacity: 0 }} end={{ opacity: 1 }}>
              <Code>{JSON.stringify(touched, null, 2)}</Code>
            </Animate>
          </section>
        )}

        {setting.showSubmit && (
          <section>
            <Title>Submit</Title>
            {!Object.keys(submitData).length && <p>ⓘ Successful submit values will display here.</p>}
            <Animate duration={0.8} play={!!Object.keys(submitData).length} start={{ opacity: 0 }} end={{ opacity: 1 }}>
              <Code>{Object.keys(submitData).length ? JSON.stringify(submitData, null, 2) : ''}</Code>
            </Animate>
          </section>
        )}
      </Wrapper>

      <section
        style={{
          textAlign: 'center',
        }}
      >
        <H1>Find it useful and interesting?</H1>
        <p>Checkout the full API documentation in a single page</p>
        <Button
          onClick={() => {
            track({
              category: 'CTA',
              label: 'Checkout hook API',
              action: 'Go to API section',
            });
            toggleApi(true);
          }}
        >
          Checkout Hook API
        </Button>
      </section>
    </>
  );
}
