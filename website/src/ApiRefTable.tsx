// @flow
import React, { useState } from 'react';
import colors from './styles/colors';
import styled from 'styled-components';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokaiSublime } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { TableWrapper, Table, Type } from './Api';

const Option = styled.fieldset`
  padding: 10px 15px;
  border: 1px solid ${colors.lightBlue};
  border-radius: 3px;

  & > legend {
    text-align: center;
  }

  & > label {
    &:nth-child(2) {
      padding-top: 10px;
    }

    padding-bottom: 15px;
    display: block;

    & > input {
      margin-right: 10px;
    }
  }
`;

export default function ApiRefTable() {
  const [isStandard, toggleOption] = useState(true);
  return (
    <>
      <p>
        This is the function to register <code>Ref</code> and validation into <code>react-hook-form</code>. Validation
        rules are all based on html input/select's standard validation, however <code>react-hook-form</code> do allow
        custom validation with method <code>validate</code>.
      </p>
      <p>
        <b>Important:</b> input name is <b>required</b> and <b>unique</b> for <code>react-hook-form</code> in order to
        register the input.
      </p>

      <Option>
        <legend>Register options</legend>
        <label>
          <input onChange={() => toggleOption(true)} type="radio" name="errorMessage" defaultChecked />
          Standard register with validation
        </label>
        <label>
          <input onChange={() => toggleOption(false)} type="radio" name="errorMessage" />
          Register with validation and error message
        </label>
      </Option>

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
                <SyntaxHighlighter style={monokaiSublime}>{`<input
  name="test"
  ref={ref =>
    register({ ref })
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
                  <Type>{isStandard ? 'boolean' : 'string'}</Type>
                </code>
              </td>
              <td>
                A Boolean which, if true, indicates that the input must have a value before the form can be submitted.
                you can assign as string to return error message in the <code>errors</code> object.
              </td>
              <td>
                <SyntaxHighlighter style={monokaiSublime}>{`<input
  name="test"
  ref={ref =>
    register({
      ref,
      ${isStandard ? 'required: true' : `required: 'error message'`}
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
                  <Type>
                    {isStandard
                      ? 'number'
                      : `{
  value: number,
  message: string
}`}
                  </Type>
                </code>
              </td>
              <td>The maximum length of the value to accept for this input.</td>
              <td>
                <SyntaxHighlighter style={monokaiSublime}>{`<input
  name="test"
  ref={ref =>
    register({
      ref,
      ${
        isStandard
          ? 'maxLength: 2'
          : `maxLength : {
        value: 2,
        message: 'error message'
      }`
      }
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
                  <Type>
                    {isStandard
                      ? 'number'
                      : `{
  value: number,
  message: string
}`}
                  </Type>
                </code>
              </td>
              <td>The minimum length of the value to accept for this input.</td>
              <td>
                <SyntaxHighlighter style={monokaiSublime}>{`<input
  name="test"
  ref={ref =>
    register({
      ref,
      minLength: ${isStandard ? 1 : `{
        value: 1,
        message: 'error message'
      }`}
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
                  <Type>
                    {isStandard
                      ? 'number'
                      : `{
  value: number,
  message: string
}`}
                  </Type>
                </code>
              </td>
              <td>The maximum value to accept for this input.</td>
              <td>
                <SyntaxHighlighter style={monokaiSublime}>{`<input
  name="test"
  ref={ref =>
    register({
      ref,
      max: ${isStandard ? 3 : `{
        value: 3,
        message: 'error message'
      }`}
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
                <code>
                  <Type>
                    {isStandard
                      ? 'number'
                      : `{
  value: number,
  message: string
}`}
                  </Type>
                </code>
              </td>
              <td>The minimum value to accept for this input.</td>
              <td>
                <SyntaxHighlighter style={monokaiSublime}>{`<input
  name="test"
  ref={ref =>
    register({
      ref,
      min: ${isStandard ? 3 : `{
        value: 3,
        message: 'error message'
      }`}
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
                  <Type>
                    {isStandard
                      ? 'RegExp'
                      : `{
  value: RegExp,
  message: string
}`}
                  </Type>
                </code>
              </td>
              <td>The regex pattern for the input.</td>
              <td>
                <SyntaxHighlighter style={monokaiSublime}>{`<input
  name="test"
  ref={ref =>
    register({
      ref,
      pattern: ${isStandard ? '\\[A-Za-z]{3}\\' : `{
        value: \\[A-Za-z]{3}\\,
        message: 'error message'
      }`}
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
                  <Type>
                    {isStandard
                      ? `(Object) => Boolean | {[key: string]: (Object) => Boolean}`
                      : `{
  value: (Object) => Boolean |

{
  [key: string]: (Object) => Boolean},
  message: string
}`}
                  </Type>
                </code>
              </td>
              <td>
                You can pass a callback function with value as the argument to validate, or you can pass an object of
                callback functions to validate all of them. (refer to the examples)
              </td>
              <td>
                <SyntaxHighlighter style={monokaiSublime}>{`<input
  name="single"
  ref={ref =>
    register({
      ref,
      validate: ${ isStandard ?
        `(value) => value === '1'`:
        `(value) => {
          return value === '1' ? 'error message' : true;
        }`}
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
          (value) => ${isStandard ? 'value > 1' : `{
            return value > 1 ? 'error message': true;
          }`},
        isLessThanTen:
          (value) => ${isStandard ? 'value > 1' : `{
            return value < 10 ? 'error message': true;
          }`},
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
    </>
  );
}
