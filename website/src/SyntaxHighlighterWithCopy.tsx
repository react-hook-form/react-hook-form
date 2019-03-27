// @flow
import React from 'react';
import styled from 'styled-components';
import copyClipBoard from './utils/copyClipBoard';
import generateCode from './logic/generateCode';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokaiSublime } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import colors from './styles/colors';

const CopyButton = styled.button`
  background: ${colors.lightBlue};
  border: none;
  color: white;
  border-radius: 4px;
  font-size: 16px;
  padding: 5px 10px;
  display: inline-block;
  position: absolute;
  right: 0;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    transform: translateY(2px);
  }
`;

export default function SyntaxHighlighterWithCopy({ rawData, data }: { rawData?: string; data?: string }) {
  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <CopyButton
        onClick={() => {
          rawData || copyClipBoard(generateCode(data));
        }}
      >
        Copy to clipboard
      </CopyButton>
      <SyntaxHighlighter style={monokaiSublime}>{rawData || generateCode(data)}</SyntaxHighlighter>
    </div>
  );
}
