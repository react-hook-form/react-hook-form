import React from 'react';
import styled from 'styled-components';
import copyClipBoard from './utils/copyClipBoard';
import generateCode from './logic/generateCode';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { xonokai } from 'react-syntax-highlighter/dist/styles/prism';
import colors from './styles/colors';

const CopyButton = styled.button`
  background: ${colors.lightBlue};
  border: none;
  color: white;
  border-radius: 4px;
  font-size: 16px;
  padding: 5px 10px;
  position: absolute;
  right: 0;
  z-index: 1;
  top: 10px;
  box-shadow: 0 0 10px #000;
  display: none;

  @media (min-width: 768px) {
    display: inline-block;
  }

  &:hover {
    opacity: 0.8;
  }

  &:active {
    transform: translateY(2px);
  }
`;

export const LinkToSandBox = styled.a`
  background: ${colors.lightPink};
  border: none;
  color: white;
  border-radius: 4px;
  font-size: 16px;
  padding: 5px 10px;
  position: absolute;
  top: 10px;
  right: 0;
  z-index: 1;
  box-shadow: 0 0 10px #000;
  text-decoration: none;

  @media (min-width: 768px) {
    display: inline-block;
    right: 170px;
  }

  &:hover {
    opacity: 0.8;
  }

  &:active {
    transform: translateY(2px);
  }
`;

export default function SyntaxHighlighterWithCopy({ rawData, data, url, tabIndex }: any) {
  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <CopyButton
        tabIndex={tabIndex}
        onClick={() => {
          rawData || copyClipBoard(generateCode(data));
          alert('Code copied into your clipboard.');
        }}
      >
        Copy to clipboard
      </CopyButton>

      {url && (
        <LinkToSandBox tabIndex={tabIndex} href={url} target="_blank">
          CodeSandbox
        </LinkToSandBox>
      )}
      <SyntaxHighlighter
        customStyle={{
          border: 'none',
        }}
        style={xonokai}
        language={'jsx'}
      >
        {rawData || generateCode(data)}
      </SyntaxHighlighter>
    </div>
  );
}
