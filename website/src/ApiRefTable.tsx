import React, { useState } from 'react';
import colors from './styles/colors';
import styled from 'styled-components';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { xonokai as monokaiSublime } from 'react-syntax-highlighter/dist/styles/prism';
import { TableWrapper, Table, Type } from './Api';
import Link from './styles/link';
import track from "./utils/track";

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

export default function ApiRefTable({ tabIndex }: any) {
  const [isStandard, toggleOption] = useState(true);
  return (
    <>
      <p>
        Register <code>Ref</code> and validation rules into <code>react-hook-form</code>. Validation rules are all based
        on html standard. In addition, <code>react-hook-form</code> do allow custom validation too.
      </p>
      <p>
        <b>Important:</b> input <code>name</code> is <b>required</b> and <b>unique</b> for <code>react-hook-form</code>{' '}
        to register them uniquely.
      </p>
      <p>
        If you working on <code>arrays/array fields</code> (inject additional form section by action), you can assign
        input name as <code>name[index]</code>.{' '}
        <Link
          tabIndex={tabIndex}
          href="https://github.com/bluebill1049/react-hook-form/blob/master/examples/arrayFields.tsx"
          title="example for array fields"
          onClick={() => {
            track({
              category: 'API',
              label: 'check out array field example',
              action: 'go to array field example'
            })
          }}
        >
          Check out the array fields example
        </Link>
        .
      </p>

      <Option>
        <legend>Register options</legend>
        <label>
          <input
            tabIndex={tabIndex}
            onChange={() => toggleOption(true)}
            type="radio"
            name="errorMessage"
            defaultChecked
          />
          Register with validation
        </label>
        <label>
          <input tabIndex={tabIndex} onChange={() => toggleOption(false)} type="radio" name="errorMessage" />
          Register with validation and error message
        </label>
      </Option>

      <TableWrapper>
        <Table>
          <tbody>
            <tr>
              <th>Name</th>
              <th
                style={{
                  minWidth: 200,
                }}
              >
                Type
              </th>
              <th
                style={{
                  minWidth: 300,
                }}
              >
                Description
              </th>
              <th
                style={{
                  minWidth: 320,
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
                  <Type>React.RefObject</Type>
                </code>
              </td>
              <td>React element ref</td>
              <td>
                <SyntaxHighlighter
                  customStyle={{
                    border: 'none',
                  }}
                  style={monokaiSublime}
                >{`<input
  name="test"
  ref={register}
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
                <SyntaxHighlighter
                  customStyle={{
                    border: 'none',
                  }}
                  style={monokaiSublime}
                >{`<input
  name="test"
  ref={
    register({
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
                <SyntaxHighlighter
                  customStyle={{
                    border: 'none',
                  }}
                  style={monokaiSublime}
                >{`<input
  name="test"
  ref={
    register({
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
                <SyntaxHighlighter
                  customStyle={{
                    border: 'none',
                  }}
                  style={monokaiSublime}
                >{`<input
  name="test"
  ref={
    register({
      minLength: ${
        isStandard
          ? 1
          : `{
        value: 1,
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
                <SyntaxHighlighter
                  customStyle={{
                    border: 'none',
                  }}
                  style={monokaiSublime}
                >{`<input
  name="test"
  ref={
    register({
      max: ${
        isStandard
          ? 3
          : `{
        value: 3,
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
                <SyntaxHighlighter
                  customStyle={{
                    border: 'none',
                  }}
                  style={monokaiSublime}
                >{`<input
  name="test"
  ref={
    register({
      min: ${
        isStandard
          ? 3
          : `{
        value: 3,
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
                <SyntaxHighlighter
                  customStyle={{
                    border: 'none',
                  }}
                  style={monokaiSublime}
                >{`<input
  name="test"
  ref={
    register({
      pattern: ${
        isStandard
          ? '\\[A-Za-z]{3}\\'
          : `{
        value: \\[A-Za-z]{3}\\,
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
                <code>validate</code>
              </td>
              <td>
                <code>
                  <Type>Function | Object</Type>
                </code>
              </td>
              <td>
                You can pass a callback function as the argument to validate, or you can pass an object of callback
                functions to validate all of them. (refer to the examples)
              </td>
              <td>
                <SyntaxHighlighter
                  customStyle={{
                    border: 'none',
                  }}
                  style={monokaiSublime}
                >{`<input
  name="single"
  ref={
    register({
      validate: ${
        isStandard
          ? `(value) => value === '1'`
          : `(value) => value === '1' || 'error message';`
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
