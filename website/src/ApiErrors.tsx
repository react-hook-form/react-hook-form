import React from 'react';
import SyntaxHighlighterWithCopy from './SyntaxHighlighterWithCopy';
import errorCode from './codeExamples/errorCode';
import { Table, TableWrapper, Type } from './Api';

export default function ApiErrors({ tabIndex }: any) {
  return (
    <>
      <code>
        <h2>
          errors: <Type>Object</Type>
        </h2>
      </code>
      <p>Object contain form errors or error messages belong to each input.</p>

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
              <td>
                <code>type</code>
              </td>
              <td>
                <Type>string</Type>
              </td>
              <td>Error type which according to your validation rules. eg: required, min, max</td>
            </tr>
            <tr>
              <td>
                <code>message</code>
              </td>
              <td>
                <Type>string</Type>
              </td>
              <td>Register with validation and error message, then error message will return in this .</td>
            </tr>
            <tr>
              <td>
                <code>ref</code>
              </td>
              <td>
                <Type>React.RefObject</Type>
              </td>
              <td>Reference fo your error input element.</td>
            </tr>
          </tbody>
        </Table>
      </TableWrapper>

      <SyntaxHighlighterWithCopy tabIndex={tabIndex} rawData={errorCode} url="https://codesandbox.io/s/nrr4n9p8n4" />

      <hr />
    </>
  );
}
