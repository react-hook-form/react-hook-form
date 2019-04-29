import React from 'react';
import styled from 'styled-components';
import formik from './assets/formik.png';
import hookFrom from './assets/hookForm.png';
import reduxForm from './assets/reduxForm.png';
import { H1, Title } from './styles/typography';
import { SimpleImg } from 'react-simple-img';

const Wrapper = styled.section`
  text-align: center;
  
  & > p {
    max-width: 1033px;
    display: block;
    margin: 0 auto;
  }

  & > img {
    max-width: 100%;
    border-radius: 4px;

    @media (min-width: 768px) {
      border-radius: 10px;
    }
  }
  
  & > h2 {
    margin-left: auto;
    margin-right: auto;
    max-width: 600px;
  }
`;

export default function CodePerfCompareSection() {
  return (
    <Wrapper>
      <H1>Performance Comparison</H1>
      <p>
        The following results are captured under 6x CPU slow down on App start with Chrome devtool's performance tab,
        and code is from section above 'Library Code Comparison'.
      </p>
      <Title>React Hook Form</Title>
      <SimpleImg src={hookFrom} placeholder={false} />
      <Title>Formik</Title>
      <SimpleImg src={formik} placeholder={false} />
      <Title>Redux Form</Title>
      <SimpleImg src={reduxForm} placeholder={false} />
    </Wrapper>
  );
}
