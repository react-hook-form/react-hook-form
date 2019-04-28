import styled from 'styled-components';
import { Title } from './styles/typography';
import copyClipBoard from '../src/utils/copyClipBoard';
import SyntaxHighlighterWithCopy from '../src/SyntaxHighlighterWithCopy';
import code from '../src/codeExamples/defaultExample';
import colors from './styles/colors';
import React from 'react';

const InstallCode = styled.span`
  background: #191d3a !important;
  padding: 13px 20px;
  border-radius: 4px;
  margin-top: 20px;
  display: block;
`;

const CopyButton = styled.button`
  background: ${colors.lightBlue};
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

export default function GetStarted({ quickStartRef, tabIndex }: any) {
  return (
    <>
      <Title>Quick Start</Title>
      <h2 ref={quickStartRef}>Installation</h2>
      <p>Installing react-hook-form only takes a single command and you're ready to roll.</p>
      <InstallCode>
        npm install react-hook-form
        <CopyButton
          tabIndex={tabIndex}
          onClick={() => {
            copyClipBoard('npm install react-hook-form');
            alert('Code copied into your clipboard.');
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
      <SyntaxHighlighterWithCopy tabIndex={tabIndex} rawData={code} url="https://codesandbox.io/s/kw7z2q2n15" />
    </>
  );
}
