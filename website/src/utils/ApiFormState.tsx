// @flow
import React from 'react';
import { LinkToSandBox } from '../SyntaxHighlighterWithCopy';
import { Table, TableWrapper, Type } from '../Api';

export default function ApiFormState({ tabIndex }: any) {
  return (
    <>
      <code>
        <h2>
          formState: <Type>Object</Type>
        </h2>
      </code>
      <p>This object contain information about the form state.</p>

      <TableWrapper>
        <Table>
          <tbody>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
            <tr>
              <td>
                <code>dirty</code>
              </td>
              <td>
                <Type>boolean</Type>
              </td>
              <td>Set to true after user interacted with any of the inputs.</td>
            </tr>
            <tr>
              <td>
                <code>isSubmitted</code>
              </td>
              <td>
                <Type>boolean</Type>
              </td>
              <td>Set true after user submitted the form.</td>
            </tr>
            <tr>
              <td>
                <code>touched</code>
              </td>
              <td>
                <Type>{`string[]`}</Type>
              </td>
              <td>An array of all inputs which have been interacted.</td>
            </tr>
            <tr>
              <td>
                <code>isSubmitting</code>
              </td>
              <td>
                <Type>boolean</Type>
              </td>
              <td>During form submitting will set to true and after submitting set to false.</td>
            </tr>
            <tr>
              <td>
                <code>submitCount</code>
              </td>
              <td>
                <Type>number</Type>
              </td>
              <td>Number of forms submit.</td>
            </tr>
          </tbody>
        </Table>
      </TableWrapper>

      <LinkToSandBox
        tabIndex={tabIndex}
        style={{
          position: 'relative',
          left: 0,
        }}
        href="https://codesandbox.io/s/7o2wrp86k6"
        target="_blank"
      >
        CodeSandbox
      </LinkToSandBox>

      <hr />
    </>
  );
}
