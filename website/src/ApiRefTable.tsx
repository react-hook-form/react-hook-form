// @flow
import React from 'react';
import colors from './styles/colors';
import styled from 'styled-components';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokaiSublime } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { TableWrapper, Table, Type } from './Api';

const Option = styled.fieldset`
  padding: 30px;
  border: 1px solid ${colors.lightBlue};
  border-radius: 3px;
  
  & > label {
    display: block;
  }
`;

export default function ApiRefTable() {
  return (
    <>
      <p>
        This is the function to register <code>Ref</code> and validation into <code>react-hook-form</code>. Validation
        rules are all based on html input/select's standard validation, however <code>react-hook-form</code> do allow
        custom validation with method <code>validate</code>.
      </p>
      <p
        style={{
          color: colors.secondary,
        }}
      >
        <b>Important:</b> input name is <b>required</b> and <b>unique</b> for <code>react-hook-form</code> in order to
        register the input.
      </p>

      <Option>
        <legend>Register with or without error message</legend>
        <label>
          <input type="radio" name="errorMessage" defaultChecked />
          only trigger errors
        </label>
        <label>
          <input type="radio" name="errorMessage" />
          trigger errors with message
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
                  <Type>boolean</Type>
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
                <SyntaxHighlighter style={monokaiSublime}>{`<input
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
                <SyntaxHighlighter style={monokaiSublime}>{`<input
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
                <SyntaxHighlighter style={monokaiSublime}>{`<input
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
                <SyntaxHighlighter style={monokaiSublime}>{`<input
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
                <SyntaxHighlighter style={monokaiSublime}>{`<input
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
                You can pass a callback function with value as the argument to validate, or you can pass an object of
                callback functions to validate all of them. (refer to the examples)
              </td>
              <td>
                <SyntaxHighlighter style={monokaiSublime}>{`<input
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
    </>
  );
}
