import React from 'react';
import styled from 'styled-components';
import copyClipBoard from './utils/copyClipBoard';
import generateCode from './logic/generateCode';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { xonokai } from 'react-syntax-highlighter/dist/styles/prism';
import colors from './styles/colors';
import track from './utils/track';

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

const SyntaxHighlighterWrapper = styled.div`
  pre {
    padding-top: 50px !important;

    @media (min-width: 1024px) {
      padding-top: 20px !important;
    }
  }
`;

export default function SyntaxHighlighterWithCopy({ rawData, data, url, tabIndex, withOutCopy }: any) {
  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      {!withOutCopy && (
        <CopyButton
          tabIndex={tabIndex}
          onClick={() => {
            track({
              label: 'copy',
              category: 'CodeExample',
              action: 'copy code',
            });
            rawData || copyClipBoard(generateCode(data));
            alert('Code copied into your clipboard.');
          }}
          aria-label="Copy code into your clipboard"
        >
          Copy to clipboard
        </CopyButton>
      )}

      {url && (
        <LinkToSandBox
          onClick={() => {
            track({
              label: 'CodeSandbox',
              category: 'CodeExample',
              action: `Go to codeSandBox ${url}`,
            });
          }}
          tabIndex={tabIndex}
          href={url}
          target="_blank"
        >
          CodeSandbox
        </LinkToSandBox>
      )}
      <SyntaxHighlighterWrapper>
        <SyntaxHighlighter
          customStyle={{
            border: 'none',
          }}
          style={xonokai}
          language={'jsx'}
        >
          {rawData || generateCode(data)}
        </SyntaxHighlighter>
      </SyntaxHighlighterWrapper>
    </div>
  );
}
