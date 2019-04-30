import React from 'react';
import { Title, H1 } from './styles/typography';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { xonokai } from 'react-syntax-highlighter/dist/styles/prism';
import styled from 'styled-components';
import formikCode from './codeExamples/formikCode';
import reactHookFormCode from './codeExamples/reactHookFormCode';
import reduxFormCode from './codeExamples/reduxFormCode';

const GridView = styled.section`
  @media (min-width: 1100px) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-column-gap: 40px;
  }

  & > section {
    scroll-snap-align: start;
  }

  & pre {
    background: none !important;
  }

  & h4 {
    text-align: center;
  }
`;

export default function CodeCompareSection() {
  return (
    <div>
      <section
        style={{
          textAlign: 'center',
          maxWidth: 1033,
          margin: '0 auto 50px',
        }}
      >
        <H1>
          <code>{`</>`}</code> Library Code Comparison
        </H1>

        <p>
          Reducing the amount of code you have to write is one of the goals for React Hook Form. To illustrate, let's
          look at a very simple form validation among some of the most popular form validation libraries.
        </p>
      </section>

      <GridView>
        <section>
          <Title>
            <svg
              style={{
                display: 'inline',
                width: 30,
                fill: 'white',
              }}
              viewBox="0 0 270 210"
            >
              <path d="M245.1,75.9c-5-4.9-11.5-7.5-18.6-7.3c-6.9,0.1-13.3,3-18.1,8.2c-4.8,5.1-7.3,11.8-7.1,18.6c0.2,5.9,2.5,11.4,6.3,15.8  c-10,12.4-19.1,18.2-27.8,17.5c-11.2-0.9-23.1-12.5-35.6-34.8c4.2-3.3,7.3-7.7,8.9-12.9c2.2-7.1,1.1-14.8-2.9-21.8  c-4.3-7.5-12.6-11.7-22.2-11.4c-0.1,0-0.2,0-0.2,0c-9.6-0.3-17.9,3.9-22.2,11.4c-4,7-5,14.8-2.9,21.8c1.6,5.1,4.7,9.6,8.9,12.9  c-12.5,22.2-24.4,33.9-35.6,34.8c-8.7,0.7-17.8-5.1-27.8-17.5c3.8-4.4,6-9.9,6.3-15.8c0.3-6.8-2.3-13.6-7.1-18.6  c-4.8-5.1-11.2-8-18.1-8.2c-7-0.1-13.6,2.5-18.6,7.3c-5,4.9-7.7,11.4-7.7,18.4c0,13.5,10.5,24.6,23.7,25.7l7.5,73.1  c0.9,8.7,8.1,15.2,16.8,15.2h153.5c8.7,0,16-6.5,16.8-15.2l7.5-73.1c13.3-1,23.7-12.1,23.7-25.7C252.8,87.3,250.1,80.8,245.1,75.9z   M227.1,110.2c-0.6,0-1.3-0.1-1.9-0.1c-1.3-0.2-2.6,0.2-3.7,1c-1,0.8-1.7,2-1.8,3.4l-7.9,77.6c-0.4,3.6-3.4,6.3-7,6.3H51.2  c-3.6,0-6.6-2.7-7-6.3l-7.9-77.6c-0.1-1.3-0.8-2.5-1.8-3.4c-0.9-0.7-2-1.1-3.1-1.1c-0.2,0-0.4,0-0.6,0c-0.6,0.1-1.2,0.1-1.9,0.1  c-8.7,0-15.8-7.1-15.8-15.9c0-4.3,1.7-8.3,4.8-11.3c3.1-3,7.2-4.6,11.4-4.5c4.2,0.1,8.1,1.9,11.1,5.1c3,3.1,4.5,7.3,4.4,11.4  c-0.2,4.6-2.4,8.9-6.1,11.8c-2.1,1.7-2.5,4.7-0.9,6.9c13.3,17.7,26.1,25.8,39.1,24.9c15.6-1.2,30.6-15.6,45.7-44  c0.6-1.2,0.8-2.6,0.3-3.8c-0.4-1.3-1.3-2.3-2.5-2.9c-3.9-1.9-6.9-5.5-8.2-9.6c-1.4-4.5-0.7-9.4,2-14c2.4-4.2,7.3-6.6,13.1-6.5  c0.4,0.1,0.8,0.1,1.2,0c5.8-0.1,10.7,2.2,13.1,6.5c2.7,4.7,3.4,9.5,2,14c-1.3,4.2-4.3,7.7-8.2,9.6c-1.2,0.6-2.1,1.6-2.5,2.9  c-0.4,1.3-0.3,2.7,0.3,3.8c15.1,28.4,30.1,42.8,45.7,44c13.1,1,25.9-7.1,39.1-24.9c1.6-2.2,1.2-5.2-0.9-6.9  c-3.7-2.9-5.9-7.2-6.1-11.8c-0.2-4.1,1.4-8.3,4.4-11.4c3-3.2,6.9-5,11.1-5.1h0c4.3-0.1,8.4,1.5,11.4,4.5c3.1,3,4.8,7,4.8,11.3  C242.9,103.1,235.8,110.2,227.1,110.2z" />
            </svg>{' '}
            React Hook Form
          </Title>
          <SyntaxHighlighter
            customStyle={{
              border: 'none',
            }}
            style={xonokai}
            language={'jsx'}
          >
            {reactHookFormCode}
          </SyntaxHighlighter>
        </section>

        <section>
          <Title>Formik</Title>
          <SyntaxHighlighter
            customStyle={{
              border: 'none',
            }}
            style={xonokai}
            language={'jsx'}
          >
            {formikCode}
          </SyntaxHighlighter>
        </section>

        <section>
          <Title>Redux Form</Title>
          <SyntaxHighlighter
            customStyle={{
              border: 'none',
            }}
            style={xonokai}
            language={'jsx'}
          >
            {reduxFormCode}
          </SyntaxHighlighter>
        </section>
      </GridView>
    </div>
  );
}
