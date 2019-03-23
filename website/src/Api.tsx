import React, { useRef, useEffect } from 'react';
import { Animate } from 'react-simple-animate';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokaiSublime } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import styled from 'styled-components';
import colors from './styles/colors';
import { SubHeading, HeadingWithTopMargin, Title } from './styles/typography';
import { setHomePage } from './ButtonGroup';

const code = `import React from 'react';
import useForm from 'react-hook-form';

function YourForm() {
  const { register, handleSubmit, watch, errors } = useForm();
  const onSubmit = data => {
    console.log(data);
  };
  {/* your form submit function which will invoke after successful validation */}

  console.log(watch('example'));
  {/* you can watch individual input by pass the name of the input */}

  return (
    {/* handleSubmit will validation your inputs before onSubmit */}
    <form onsubmit={handleSubmit(onSubmit)}>
      {/* you will have to register your input into react-hook-form, by invoke the register function with ref as the argument */}
      <input
        type="text"
        name="example"
        ref={ref => {
          register({ ref });
        }}
      />
      {/* include validation with required field or other standard html validation rules  */}
      <input
        type="text"
        name="exampleRequired"
        ref={ref => {
          register({ ref, required: true, max: 10 });
        }}
      />
      {/* errors will return true if particular field validation is invalid  */}
      {errors.example && '<span>This field is required</span>'}
      <input type="submit" />
    </form>
  );
}

`;

const errorCode = `import React from 'react'
import useForm from 'react-hook-form

function YourForm() {
  const { register, errors, handleSubmit } = useForm();
  const onSubmit = (data) => {};
  
  return (
    <form onsubmit={handleSubmit(onSubmit)}>
      <input type="text" name="textInput" ref={ ref => { register({ ref, required, maxLength: 50 })} } />
      {errors.textInput && errors.textInput.required && 'Your input is required'}
      {errors.textInput && errors.textInput.maxLength && 'Your input exceed maxLength'}
      
      <input type="number" name="numberInput" ref={ ref => { register({ ref, min: 50 })} } />
      {errors.numberInput && errors.numberInput.min && 'Your input required to be more than 50'}
      <input type="submit" /> 
    </form>
  )
}
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
  padding: 0 20px;
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

const Table = styled.table`
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

const TableWrapper = styled.div`
  overflow: scroll;
  -webkit-overflow-scrolling: touch;
`;

const Type = styled.span`
  font-weight: 100;
  font-size: 15px;
  color: ${colors.lightPink};
`;

const Wrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;

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

const links = ['Quick Start', 'useform', 'register', 'errors', 'watch', 'handleSubmit'];

function Builder({ formData, updateFormData, showApi, toggleApi, apiButton, isMobile }: any) {
  const copyFormData = useRef([]);
  const closeButton = useRef(null);
  const quickStartRef = useRef(null);
  const useFormRef = useRef(null);
  const registerRef = useRef(null);
  const errorsRef = useRef(null);
  const watchRef = useRef(null);
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
                  <code>npm install react-form</code>

                  <h2>Example</h2>
                  <p>The following code will demonstrate the basic usage of react-hook-form.</p>
                  <SyntaxHighlighter style={monokaiSublime}>{code}</SyntaxHighlighter>

                  <Title>API</Title>

                  <code ref={useFormRef}>
                    <h2>
                      useForm:{' '}
                      <Type
                      >{`({ mode: 'onSubmit' | 'onBlur' | 'onChange' }):{ register, errors, handleSubmit, watch }`}</Type>
                    </h2>
                  </code>
                  <p>
                    You need to initialize <code>useForm</code> before you can start register your inputs, run this
                    function before render.
                  </p>
                  <p>
                    React hook form use hook behind the scene by invoke <code>useForm</code>, you will receive the 4
                    methods.
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
                            This is the default option, validation will trigger on submit and then attach{' '}
                            <code>onchange</code> event listeners to re-validate them.
                          </td>
                        </tr>
                        <tr>
                          <td>onBlur</td>
                          <td>
                            <Type>string</Type>
                          </td>
                          <td>Validation will trigger on each input blur event.</td>
                        </tr>
                        <tr>
                          <td>onChange</td>
                          <td>
                            <Type>string</Type>
                          </td>
                          <td>
                            Not recommended as validation will go through each change on your input, consider this as a
                            bad performance practice.
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
                  <p>
                    This is the function to register <code>Ref</code> into <code>react-hook-form</code> and also
                    includes validation rules. Validation rules are all based on html input/select validation standard
                    except there one method <code>validate</code> which allow you to do some custom validation.
                  </p>
                  <p
                    style={{
                      color: colors.secondary,
                    }}
                  >
                    <b>Important:</b> input name is <b>required</b> and <b>unique</b> for react-hook-form in order to
                    register the input.
                  </p>

                  <TableWrapper>
                    <Table>
                      <tbody>
                        <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Description</th>
                          <th
                            style={{
                              minWidth: 310,
                            }}
                          >
                            Example
                          </th>
                        </tr>
                        <tr>
                          <td>
                            <code>ref</code>
                          </td>
                          <td>
                            <code>
                              <Type>HTMLInputElement</Type>
                            </code>
                          </td>
                          <td>React element ref</td>
                          <td>
                            <SyntaxHighlighter
                              style={monokaiSublime}
                            >{`<input
  name="test"
  ref={ref =>
    register({
      ref
    })
  }
/>`}</SyntaxHighlighter>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <code>required</code>
                          </td>
                          <td>
                            <code>
                              <Type>boolean</Type>
                            </code>
                          </td>
                          <td>
                            A Boolean which, if true, indicates that the input must have a value before the form can be
                            submitted.
                          </td>
                          <td>
                            <SyntaxHighlighter
                              style={monokaiSublime}
                            >{`<input
  name="test"
  ref={ref =>
    register({
      ref,
      required: true
    })
  }
/>`}</SyntaxHighlighter>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <code>maxLength</code>
                          </td>
                          <td>
                            <code>
                              <Type>number</Type>
                            </code>
                          </td>
                          <td>The maximum length of the value to accept for this input.</td>
                          <td>
                            <SyntaxHighlighter
                              style={monokaiSublime}
                            >{`<input
  name="test"
  ref={ref =>
    register({
      ref,
      maxLength: 2
    })
  }
/>`}</SyntaxHighlighter>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <code>minLength</code>
                          </td>
                          <td>
                            <code>
                              <Type>number</Type>
                            </code>
                          </td>
                          <td>The minimum length of the value to accept for this input.</td>
                          <td>
                            <SyntaxHighlighter
                              style={monokaiSublime}
                            >{`<input
  name="test"
  ref={ref =>
    register({
      ref,
      minLength: 1
    })
  }
/>`}</SyntaxHighlighter>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <code>max</code>
                          </td>
                          <td>
                            <code>
                              <Type>number</Type>
                            </code>
                          </td>
                          <td>The maximum value to accept for this input.</td>
                          <td>
                            <SyntaxHighlighter
                              style={monokaiSublime}
                            >{`<input
  name="test"
  ref={ref =>
    register({
      ref,
      max: 3
    })
  }
/>`}</SyntaxHighlighter>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <code>min</code>
                          </td>
                          <td>
                            <Type>number</Type>
                          </td>
                          <td>The minimum value to accept for this input.</td>
                          <td>
                            <SyntaxHighlighter
                              style={monokaiSublime}
                            >{`<input
  name="test"
  ref={ref =>
    register({
      ref,
      min: 3
    })
  }
/>`}</SyntaxHighlighter>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <code>pattern</code>
                          </td>
                          <td>
                            <code>
                              <Type>RegExp</Type>
                            </code>
                          </td>
                          <td>The regex pattern for the input.</td>
                          <td>
                            <SyntaxHighlighter
                              style={monokaiSublime}
                            >{`<input
  name="test"
  ref={ref =>
    register({
      ref,
      pattern: \\[A-Za-z]{3}\\

    })
  }
/>`}</SyntaxHighlighter>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <code>validate</code>
                          </td>
                          <td>
                            <code>
                              <Type>{`(Object) => Boolean | {[key: string]: (Object) => Boolean}`}</Type>
                            </code>
                          </td>
                          <td>
                            You can pass a callback function with value as the argument to validate, or you can pass an object of callback functions to validate all of them. (refer to the examples)
                          </td>
                          <td>
                            <SyntaxHighlighter
                              style={monokaiSublime}
                            >{`<input
  name="single"
  ref={ref =>
    register({
      ref,
      validate:
        (value) => value === '1'
    })
  }
/>
<input
  name="multiple"
  ref={ref =>
    register({
      ref,
      validate: {
        isMoreThanOne:
          (value) => value > 1,
        isLessThanTen:
          (value) => value < 10,
      }
    })
  }
/>
`}</SyntaxHighlighter>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </TableWrapper>

                  <hr />
                  <code ref={errorsRef}>
                    <h2>
                      errors: <Type>{`{[key: string]: Object}`}</Type>
                    </h2>
                  </code>
                  <p>Object contain error info about the individual input.</p>
                  <SyntaxHighlighter style={monokaiSublime}>{errorCode}</SyntaxHighlighter>

                  <hr />
                  <code ref={watchRef}>
                    <h2>
                      watch: <Type>({`string | Array<string> | undefined`}) => string | number | boolean</Type>
                    </h2>
                  </code>
                  <p>Watch over input or selection change.</p>
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

                  <hr />
                  <code ref={handleSubmitRef}>
                    <h2>
                      handleSubmit: <Type>({`{ [key: string]: string | number | boolean }`}) => void</Type>
                    </h2>
                  </code>
                  <p
                    style={{
                      marginBottom: 200,
                    }}
                  >
                    This function will pass you the form data when from validation is successful.
                  </p>
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
