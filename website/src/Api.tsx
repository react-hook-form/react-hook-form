import React, { useRef, useEffect } from 'react';
import { Animate } from 'react-simple-animate';
import { monokaiSublime } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import styled from 'styled-components';
import colors from './styles/colors';
import { SubHeading, HeadingWithTopMargin, Title } from './styles/typography';
import { setHomePage } from './ButtonGroup';
import copyClipBoard from './utils/copyClipBoard';
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

      & > li {
        line-height: 22px;
        margin-bottom: 22px;

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

  @media (min-width: 768px) {
    font-size: 35px;
    padding: 20px;
    top: 15px;
    right: 20px;
  }
`;

const Code = styled.span`
  color: ${colors.lightPink};
  font-size: 14px;
`;

const InstallCode = styled.span`
  background: #191d3a !important;
  padding: 13px 20px;
  border-radius: 4px;
  margin-top: 20px;
  display: block;
`;

const CopyButton = styled.button`
  background: #516391;
  border: none;
  color: white;
  border-radius: 4px;
  font-size: 16px;
  float: right;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    transform: translateY(2px);
  }
`;

const links = ['Quick Start', 'useform', 'register', 'errors', 'watch', 'handleSubmit', 'validationSchema'];

function Builder({ formData, updateFormData, showApi, toggleApi, apiButton, isMobile }: any) {
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
                  </ul>
                </Menu>
                <div>
                  <Title>Quick Start</Title>
                  <h2 ref={quickStartRef}>Installation</h2>
                  <p>Installing react-hook-form only takes a single command and you're ready to roll.</p>
                  <InstallCode>
                    npm install react-hook-form
                    <CopyButton
                      onClick={() => {
                        copyClipBoard('npm install react-hook-form');
                      }}
                    >
                      Copy
                    </CopyButton>
                  </InstallCode>

                  <h2
                    style={{
                      marginTop: 50,
                    }}
                  >
                    Example
                  </h2>
                  <p>The following code will demonstrate the basic usage of react-hook-form.</p>
                  <SyntaxHighlighterWithCopy rawData={code} />

                  <Title>API</Title>

                  <code ref={useFormRef}>
                    <h2>
                      useForm: <Type>{`({ mode: 'onSubmit' | 'onBlur' | 'onChange', validationSchema: any })`}</Type>
                    </h2>
                  </code>
                  <p>
                    You need to initialize <code>useForm</code> before you can start register your inputs, run this
                    function before render.
                  </p>
                  <p>
                    React hook form use hook behind the scene by invoking <code>useForm</code>, you will receive the 4
                    methods.
                  </p>
                  <p>
                    If you would like to apply form validation rules at a schema level, please refer the{' '}
                    <CodeAsLink onClick={() => goToSection('validationSchemaCode')}>validationSchema</CodeAsLink> section.
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
                          <td>onSubmit</td>
                          <td>
                            <Type>string</Type>
                          </td>
                          <td>
                            This is the default option, validation will trigger on submit, and then attach{' '}
                            <code>onchange | blur | input</code> event listeners to re-validate them.
                          </td>
                        </tr>
                        <tr>
                          <td>onBlur</td>
                          <td>
                            <Type>string</Type>
                          </td>
                          <td>
                            Validation will trigger on each input <code>blur</code> event.
                          </td>
                        </tr>
                        <tr>
                          <td>onChange</td>
                          <td>
                            <Type>string</Type>
                          </td>
                          <td>
                            Not recommended as validation will go through each change on your input, and hence trigger
                            render. Consider this as a bad performance practice.
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
                      errors: <Type>{`{[key: string]: Object}`}</Type>
                    </h2>
                  </code>
                  <p>Object contain error info about the individual input.</p>
                  <SyntaxHighlighterWithCopy rawData={errorCode} />

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
                    Watch over input or selection change. Inital <code>watch</code> will always return{' '}
                    <code>undefined</code>, because watch will run <strong>before</strong> the render fucntion . however
                    you can set default value as the second argument, this is normally useful when you have some inital
                    value to overwrite when <code>watch</code> return <code>undefined</code> on inital run.
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
                  <SyntaxHighlighterWithCopy rawData={watchCode} />

                  <hr />
                  <code ref={handleSubmitRef}>
                    <h2>
                      handleSubmit: <Type>({`{ [key: string]: string | number | boolean }`}) => void</Type>
                    </h2>
                  </code>
                  <p>This function will pass you the form data when from validation is successful.</p>

                  <hr />

                  <code ref={validationSchemaRef}>
                    <h2>
                      validationSchema: <Type>any</Type>
                    </h2>
                  </code>

                  <p>
                    If you would like to centralise your validation rules or external validation schema, you can apply
                    <code>validationSchema</code> when you invoke <code>useForm</code>. we use{' '}
                    <Link href="https://github.com/jquense/yup" target="_blank">
                      Yup
                    </Link>{' '}
                    for object schema validation and the example below demonstrate the usage.
                  </p>
                  <SyntaxHighlighterWithCopy rawData={validationSchemaCode} />
                </div>
              </Wrapper>
            </div>
          </Root>
        );
      }}
    />
  );
}

export default React.memo(Builder);
