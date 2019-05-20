import React, { useRef, useEffect } from 'react';
import { Animate } from 'react-simple-animate';
import styled from 'styled-components';
import colors from './styles/colors';
import { SubHeading, HeadingWithTopMargin, Title, H5 } from './styles/typography';
import { setHomePage } from './ButtonGroup';
import GetStarted from './GetStarted';
import ApiRefTable from './ApiRefTable';
import validationSchemaCode from './codeExamples/validationSchema';
import Link from './styles/link';
import code from './codeExamples/defaultExample';
import SyntaxHighlighterWithCopy from './SyntaxHighlighterWithCopy';
import ApiMenu from './ApiMenu';
import ApiFormState from './utils/ApiFormState';
import resetCode from './codeExamples/resetCode';
import ApiWatch from './ApiWatch';
import ApiErrors from './ApiErrors';
import handleSubmitCode from './codeExamples/handleSubmitCode';
import setError from './codeExamples/setError';
import setValue from './codeExamples/setValue';
import track from './utils/track';

const CodeAsLink = styled(Link)`
  cursor: pointer;
`;

const Root = styled.main`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: #0e101c;
  z-index: 4;
  color: white;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  overflow: hidden;
  
  & hr {
    border: none;
    border-top: 1px solid ${colors.lightBlue}
    margin: 40px 0;
    display: block;
  }

  & pre,
  & code {
    font-size: 14px;
    text-align: left;
    color: white;
    overflow-x: auto;
    overflow-y:hidden;
    white-space: pre-wrap;
    word-wrap: break-word;
    background: none !important;
    line-height: 1.3;
  }
`;

export const Table = styled.table`
  margin-top: 20px;

  th {
    text-align: left;
  }

  td {
    vertical-align: top;
    padding: 10px 20px 10px 0;
    line-height: 1.4;

    & > pre {
      margin: 0;
    }
  }
`;

export const TableWrapper = styled.div`
  -webkit-overflow-scrolling: touch;
  overflow-y: hidden;
  overflow-x: auto;
`;

export const Type = styled.span`
  font-weight: 100;
  font-size: 15px;
  font-family: monospace;
  color: ${colors.lightPink};
`;

const Wrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
  padding: 0 20px 100px 20px;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 250px minmax(0, 1fr);
  }
`;

const CloseButton = styled.button`
  font-size: 30px;
  top: 0;
  right: 0;
  padding: 20px;
  position: absolute;
  cursor: pointer;
  border: none;
  font-weight: 200;
  z-index: 5;
  border-radius: 10px;
  color: white;
  background: rgba(14, 16, 28, 0.5294117647058824);
  display: none;

  @media (min-width: 768px) {
    font-size: 35px;
    display: block;
    padding: 20px;
    top: 15px;
    right: 20px;
  }
`;

const links = [
  'Quick Start',
  'Examples',
  'useForm',
  'register',
  'errors',
  'watch',
  'handleSubmit',
  'reset',
  'setError',
  'setValue',
  'formState',
  // 'validationSchema',
];

function Builder({ formData, showApi, toggleApi, apiButton, isMobile }: any) {
  const copyFormData = useRef([]);
  const closeButton = useRef(null);
  const apiSectionsRef = useRef({
    quickStartRef: null,
    formStateRef: null,
    useFormRef: null,
    registerRef: null,
    resetRef: null,
    errorsRef: null,
    watchRef: null,
    setErrorRef: null,
    validationSchemaRef: null,
    handleSubmitRef: null,
  });
  const root = useRef(null);
  const tabIndex = showApi ? 0 : -1;
  copyFormData.current = formData;

  const goToSection = name => {
    const refName = `${name}Ref`;
    track({
      category: 'GoToSection',
      label: `Go to section ${refName}`,
      action: `Go to section ${refName}`,
    });
    if (apiSectionsRef.current[refName]) {
      apiSectionsRef.current[refName].scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (showApi && closeButton.current) {
      // @ts-ignore
      closeButton.current.focus();
    }
  }, [showApi]);

  return (
    <Animate
      play={showApi}
      easeType="ease-in"
      duration={isMobile ? 0.3 : 0.5}
      start={{
        transform: 'translateY(100vh)',
      }}
      end={{
        transform: 'translateY(0)',
      }}
      render={({ style }) => {
        return (
          <Root style={style} ref={root}>
            <div
              id="api"
              style={{
                overflow: 'auto',
                height: '100vh',
                background: colors.primary,
              }}
            >
              <CloseButton
                aria-label="close api"
                ref={closeButton}
                tabIndex={tabIndex}
                onClick={() => {
                  toggleApi(false);
                  apiButton.current.focus();
                  setHomePage();
                }}
              >
                &#10005;
              </CloseButton>
              <HeadingWithTopMargin>API</HeadingWithTopMargin>
              <SubHeading>React hook form focus on providing the best DX by simplify the API.</SubHeading>

              <Wrapper>
                <ApiMenu tabIndex={tabIndex} links={links} goToSection={goToSection} />
                <main>
                  <GetStarted
                    tabIndex={tabIndex}
                    quickStartRef={ref => {
                      // @ts-ignore
                      apiSectionsRef.current['Quick StartRef'] = ref;
                    }}
                  />

                  <Title>API</Title>

                  <code
                    ref={ref => {
                      // @ts-ignore
                      apiSectionsRef.current.useFormRef = ref;
                    }}
                  >
                    <h2>
                      useForm: <Type>Function</Type>
                    </h2>
                  </code>
                  <p>
                    By invoking <code>useForm</code>, you will receive methods to{' '}
                    <CodeAsLink onClick={() => goToSection('register')}>register</CodeAsLink>,{' '}
                    <CodeAsLink onClick={() => goToSection('errors')}>errors</CodeAsLink>,{' '}
                    <CodeAsLink onClick={() => goToSection('handleSubmit')}>handleSubmit</CodeAsLink>,{' '}
                    <CodeAsLink onClick={() => goToSection('reset')}>reset</CodeAsLink>,{' '}
                    <CodeAsLink onClick={() => goToSection('setError')}>setError</CodeAsLink>,{' '}
                    <CodeAsLink onClick={() => goToSection('setValue')}>setValue</CodeAsLink>,{' '}
                    <CodeAsLink onClick={() => goToSection('formState')}>formState</CodeAsLink>,{' '}
                    <CodeAsLink onClick={() => goToSection('watch')}>watch</CodeAsLink> and{' '}
                    <CodeAsLink onClick={() => goToSection('formState')}>formState</CodeAsLink>.
                  </p>

                  <p>
                    <code>useForm</code> also has <b>optional</b> argument, which are <code>mode</code>,{' '}
                    <code>defaultValues</code> and <code>validationSchema</code>.
                  </p>

                  <SyntaxHighlighterWithCopy
                    tabIndex={tabIndex}
                    withOutCopy
                    rawData={`const { register } = useForm({
  mode: 'onBlur',
  defaultValues: {
    firstName: 'bill',
    lastName: 'luo'
  },
  validationSchema: {},
});`}
                  />

                  <H5>
                    <code>mode</code>
                  </H5>

                  <TableWrapper>
                    <Table>
                      <tbody>
                        <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th
                            style={{
                              minWidth: 300,
                            }}
                          >
                            Description
                          </th>
                        </tr>
                        <tr>
                          <td>onSubmit (Default)</td>
                          <td>
                            <Type>string</Type>
                          </td>
                          <td>
                            Validation will trigger on submit, invalid inputs will attach <code>onChange</code> event
                            listeners to re-validate them.
                          </td>
                        </tr>
                        <tr>
                          <td>onBlur</td>
                          <td>
                            <Type>string</Type>
                          </td>
                          <td>
                            Validation will trigger on <code>blur</code> event.
                          </td>
                        </tr>
                        <tr>
                          <td>onChange</td>
                          <td>
                            <Type>string</Type>
                          </td>
                          <td>
                            Validation will trigger <code>onChange</code> with each inputs, and lead to multiple
                            re-render. Not recommended: Consider this as a bad performance practice.
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </TableWrapper>

                  <H5 style={{ marginTop: 20 }}>
                    <code>defaultValues</code>
                  </H5>

                  <p>
                    You can set set input default value with <code>defaultValue/defaultChecked</code>{' '}
                    <Link href="https://reactjs.org/docs/uncontrolled-components.html" onClick={() => {
                      track({
                        category: 'API',
                        label: 'read more at React doc',
                        action: 'go to React Doc'
                      })
                    }}>
                      (read more at React doc for uncontrolled input default value)
                    </Link>{' '}
                    or invoke <code>useForm</code> and pass `defaultValues` for the entire form.
                  </p>

                  <SyntaxHighlighterWithCopy
                    url="https://codesandbox.io/s/react-hook-form-defaultvalues-n5gvx"
                    tabIndex={tabIndex}
                    rawData={`const { register } = useForm({
  defaultValues: {
    firstName: "bill",
    lastName: "luo",
    email: "bluebill1049@hotmail.com"
  }
});`}
                  />

                  <H5 style={{ marginTop: 20 }}>
                    <code>validationSchema</code>
                  </H5>

                  <p>
                    Apply form validation rules at the schema level, please refer the{' '}
                    <CodeAsLink onClick={() => goToSection('validationSchema')}>validationSchema</CodeAsLink> section.
                  </p>

                  <hr />

                  <code
                    ref={ref => {
                      // @ts-ignore
                      apiSectionsRef.current.registerRef = ref;
                    }}
                  >
                    <h2>
                      register: <Type>Function</Type>
                    </h2>
                  </code>

                  <ApiRefTable tabIndex={tabIndex} />

                  <hr />
                  <section
                    ref={ref => {
                      // @ts-ignore
                      apiSectionsRef.current.errorsRef = ref;
                    }}
                  >
                    <ApiErrors tabIndex={tabIndex} />
                  </section>

                  <section
                    ref={ref => {
                      // @ts-ignore
                      apiSectionsRef.current.watchRef = ref;
                    }}
                  >
                    <ApiWatch tabIndex={tabIndex} />
                  </section>
                  <code
                    ref={ref => {
                      // @ts-ignore
                      apiSectionsRef.current.handleSubmitRef = ref;
                    }}
                  >
                    <h2>
                      handleSubmit: <Type>(data: Object, e: Event) => void</Type>
                    </h2>
                  </code>
                  <p>This function will pass you the form data when form validation is successful.</p>
                  <SyntaxHighlighterWithCopy
                    tabIndex={tabIndex}
                    rawData={handleSubmitCode}
                    url="https://codesandbox.io/s/yj07z1639"
                  />

                  <hr />

                  <code
                    ref={ref => {
                      // @ts-ignore
                      apiSectionsRef.current.resetRef = ref;
                    }}
                  >
                    <h2>
                      reset: <Type>Function</Type>
                    </h2>
                  </code>
                  <p>This function will reset fields value and errors within the form.</p>

                  <SyntaxHighlighterWithCopy
                    tabIndex={tabIndex}
                    rawData={resetCode}
                    url="https://codesandbox.io/s/jjm3wyqmjy"
                  />

                  <hr />

                  <code
                    ref={ref => {
                      // @ts-ignore
                      apiSectionsRef.current.setErrorRef = ref;
                    }}
                  >
                    <h2>
                      setError: <Type>(name: string, type: string, message: string, ref: Ref) => void</Type>
                    </h2>
                  </code>
                  <p>This function allows you to manually set an input error or clear one.</p>

                  <SyntaxHighlighterWithCopy
                    tabIndex={tabIndex}
                    rawData={setError}
                    url="https://codesandbox.io/s/o7rxyym3q5"
                  />

                  <hr />

                  <code
                    ref={ref => {
                      // @ts-ignore
                      apiSectionsRef.current.setValueRef = ref;
                    }}
                  >
                    <h2>
                      setValue: <Type>(name: string, value: string | number | boolean) => void</Type>
                    </h2>
                  </code>
                  <p>This function allows you to dynamically set input/select value.</p>

                  <SyntaxHighlighterWithCopy
                    tabIndex={tabIndex}
                    rawData={setValue}
                    url="https://codesandbox.io/s/react-hook-form-set-inputselect-value-c46ly"
                  />

                  <hr />

                  <section
                    ref={ref => {
                      // @ts-ignore
                      apiSectionsRef.current.formStateRef = ref;
                    }}
                  >
                    <ApiFormState tabIndex={tabIndex} />
                  </section>

                  <code
                    ref={ref => {
                      // @ts-ignore
                      apiSectionsRef.current.validationSchemaRef = ref;
                    }}
                  >
                    <h2>
                      validationSchema: <Type>Object</Type>
                    </h2>
                  </code>

                  <p>
                    If you would like to centralize your validation rules or external validation schema, you can apply{' '}
                    <code>validationSchema</code> when you invoke <code>useForm</code>. we use{' '}
                    <Link href="https://github.com/jquense/yup" target="_blank" tabIndex={tabIndex}>
                      Yup
                    </Link>{' '}
                    for object schema validation and the example below demonstrate the usage.
                  </p>
                  <SyntaxHighlighterWithCopy
                    tabIndex={tabIndex}
                    rawData={validationSchemaCode}
                    url="https://codesandbox.io/s/928po918qr"
                  />

                  <hr />
                </main>
              </Wrapper>
            </div>
          </Root>
        );
      }}
    />
  );
}

export default React.memo(Builder);
