import React, { useRef, useEffect } from 'react';
import { Animate } from 'react-simple-animate';
import styled from 'styled-components';
import colors from './styles/colors';
import { SubHeading, HeadingWithTopMargin, Title } from './styles/typography';
import { setHomePage } from './ButtonGroup';
import GetStarted from './GetStarted';
import ApiRefTable from './ApiRefTable';
import watchCode from './codeExamples/watchCode';
import validationSchemaCode from './codeExamples/validationSchema';
import Link from './styles/link';
import code from './codeExamples/defaultExample';
import errorCode from './codeExamples/errorCode';
import SyntaxHighlighterWithCopy from './SyntaxHighlighterWithCopy';

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
  margin-top: 40px;

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
  color: ${colors.lightPink};
`;

const Wrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
  padding: 20px 20px 100px 20px;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 250px 1fr;
  }
`;

const Menu = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: block;

    & > ul {
      position: fixed;
      list-style: none;
      padding: 0;

      & > li:first-child > button {
        font-size: 1.5rem;
      }

      & > li {
        line-height: 22px;
        margin-bottom: 22px;

        & > a {
          text-decoration: none;
          padding-left: 30px;
        }

        & > a,
        & > button {
          font-size: 20px;
          color: white;
          text-decoration: none;
          transition: 0.3s all;
          background: none;
          border: none;
          cursor: pointer;
          border-bottom: 1px solid transparent;

          &:hover {
            border-bottom: 1px solid ${colors.lightPink};
          }
        }
      }
    }
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

const Code = styled.span`
  color: ${colors.lightPink};
  font-size: 14px;
`;

const links = ['Quick Start', 'useform', 'register', 'errors', 'watch', 'handleSubmit', 'validationSchema'];

function Builder({ formData, showApi, toggleApi, apiButton, isMobile }: any) {
  const copyFormData = useRef([]);
  const closeButton = useRef(null);
  const quickStartRef = useRef(null);
  const useFormRef = useRef(null);
  const registerRef = useRef(null);
  const errorsRef = useRef(null);
  const watchRef = useRef(null);
  const validationSchemaRef = useRef(null);
  const handleSubmitRef = useRef(null);
  copyFormData.current = formData;

  const goToSection = name => {
    switch (name) {
      case links[0]:
        // @ts-ignore
        if (quickStartRef) quickStartRef.current.scrollIntoView({ behavior: 'smooth' });
        break;
      case links[1]:
        // @ts-ignore
        if (useFormRef) useFormRef.current.scrollIntoView({ behavior: 'smooth' });
        break;
      case links[2]:
        // @ts-ignore
        if (registerRef) registerRef.current.scrollIntoView({ behavior: 'smooth' });
        break;
      case links[3]:
        // @ts-ignore
        if (errorsRef) errorsRef.current.scrollIntoView({ behavior: 'smooth' });
        break;
      case links[4]:
        // @ts-ignore
        if (watchRef) watchRef.current.scrollIntoView({ behavior: 'smooth' });
        break;
      case links[5]:
        // @ts-ignore
        if (handleSubmitRef) handleSubmitRef.current.scrollIntoView({ behavior: 'smooth' });
        break;
      case links[6]:
        // @ts-ignore
        if (validationSchemaRef) validationSchemaRef.current.scrollIntoView({ behavior: 'smooth' });
        break;
    }
  };

  useEffect(
    () => {
      if (showApi && closeButton.current) {
        // @ts-ignore
        closeButton.current.focus();
      }
    },
    [showApi],
  );

  return (
    <Animate
      play={showApi}
      type="ease-in"
      durationSeconds={isMobile ? 0.3 : 0.5}
      startStyle={{
        transform: 'translateY(100vh)',
      }}
      endStyle={{
        transform: 'translateY(0)',
      }}
      render={({ style }) => {
        return (
          <Root style={style}>
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
                tabIndex={0}
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
                <Menu>
                  <ul>
                    {links.map(link => {
                      return (
                        <li key={link} onClick={() => goToSection(link)}>
                          {link !== 'Quick Start' && <Code>{`</>`}</Code>} <button>{link}</button>
                        </li>
                      );
                    })}
                    <li>
                      <a href="https://github.com/bluebill1049/react-hook-form/tree/master/examples" target="_blank">
                        Examples
                      </a>
                    </li>
                  </ul>
                </Menu>
                <main>
                  <GetStarted quickStartRef={quickStartRef} />

                  <Title>API</Title>

                  <code ref={useFormRef}>
                    <h2>
                      useForm: <Type>{`{ mode?: 'onSubmit' | 'onBlur' | 'onChange', validationSchema?: any }`}</Type>
                    </h2>
                  </code>
                  <p>
                    By invoking <code>useForm</code>, you will receive methods to register, watch, validate and print
                    errors. (run <code>useForm</code> before <code>render</code>)
                  </p>
                  <p>
                    Apply form validation rules at the schema level, please refer the{' '}
                    <CodeAsLink onClick={() => goToSection('validationSchema')}>validationSchema</CodeAsLink> section.
                  </p>

                  <TableWrapper>
                    <Table>
                      <tbody>
                        <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Description</th>
                        </tr>
                        <tr>
                          <td>onSubmit (Default)</td>
                          <td>
                            <Type>string</Type>
                          </td>
                          <td>
                            Validation will trigger on submit, and then attach <code>onchange | blur | input</code>{' '}
                            event listeners to re-validate them.
                          </td>
                        </tr>
                        <tr>
                          <td>onBlur</td>
                          <td>
                            <Type>string</Type>
                          </td>
                          <td>
                            Validation will trigger on input <code>blur</code> event.
                          </td>
                        </tr>
                        <tr>
                          <td>onChange</td>
                          <td>
                            <Type>string</Type>
                          </td>
                          <td>
                            (Not recommended) Validation will trigger <code>onChange</code> with each inputs, and lead
                            to multiple render. Consider this as a bad performance practice.
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </TableWrapper>

                  <hr />

                  <code ref={registerRef}>
                    <h2>
                      register: <Type>(args: Object):void</Type>
                    </h2>
                  </code>

                  <ApiRefTable />

                  <hr />
                  <code ref={errorsRef}>
                    <h2>
                      errors:{' '}
                      <Type>{`{
  [key: string]:
    | {
        ref: any;
        message: string | boolean;
        type: string;
      }
    | {};
}`}</Type>
                    </h2>
                  </code>
                  <p>Object contain form errors or error messages belong to each input.</p>
                  <SyntaxHighlighterWithCopy rawData={errorCode} url="https://codesandbox.io/s/nrr4n9p8n4" />

                  <hr />
                  <code ref={watchRef}>
                    <h2>
                      watch:{' '}
                      <Type>
                        (watchName: {`string | Array<string> | undefined`}, defaultValue:{' '}
                        {`string | Array<string> | undefined`}) => string | number | boolean
                      </Type>
                    </h2>
                  </code>
                  <p>
                    Watch over input change and return its value. first-time run <code>watch</code> will always return{' '}
                    <code>undefined</code> because called before <code>render</code>. You can set the default value as the
                    second argument.
                  </p>
                  <TableWrapper>
                    <Table>
                      <tbody>
                        <tr>
                          <th>Type</th>
                          <th>Description</th>
                          <th>Example</th>
                        </tr>
                        <tr>
                          <td>
                            <Type>string</Type>
                          </td>
                          <td>Target on individual input</td>
                          <td>
                            <code>const value = watch('inputName');</code>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Type>{`Array<string>`}</Type>
                          </td>
                          <td>Watch multiple inputs over the form</td>
                          <td>
                            <code>const values = watch(['inputName1', 'inputName2']);</code>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Type>undefined</Type>
                          </td>
                          <td>Watch every input fields in the form</td>
                          <td>
                            <code>const values = watch();</code>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </TableWrapper>
                  <SyntaxHighlighterWithCopy rawData={watchCode} url="https://codesandbox.io/s/pp1l40q7wx" />

                  <hr />
                  <code ref={handleSubmitRef}>
                    <h2>
                      handleSubmit: <Type>({`{ [key: string]: string | number | boolean }`}) => void</Type>
                    </h2>
                  </code>
                  <p>This function will pass you the form data when form validation is successful.</p>

                  <hr />

                  <code ref={validationSchemaRef}>
                    <h2>
                      validationSchema: <Type>any</Type>
                    </h2>
                  </code>

                  <p>
                    If you would like to centralize your validation rules or external validation schema, you can apply{' '}
                    <code>validationSchema</code> when you invoke <code>useForm</code>. we use{' '}
                    <Link href="https://github.com/jquense/yup" target="_blank">
                      Yup
                    </Link>{' '}
                    for object schema validation and the example below demonstrate the usage.
                  </p>
                  <SyntaxHighlighterWithCopy rawData={validationSchemaCode} url="https://codesandbox.io/s/928po918qr" />
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
