import React from 'react';
import styled from 'styled-components';
import formik from './assets/formik.png';
import hookFrom from './assets/hookForm.png';
import reduxForm from './assets/reduxForm.png';
import { H1, Title } from './styles/typography';
import Link from './styles/link';
import { SimpleImg } from 'react-simple-img';
import colors from './styles/colors';

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

const ImgSection = styled.div`
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
  }

  & > img {
    align-self: center;
    border-radius: 4px;
    max-width: 100%;
    margin: 20px 0;

    @media (min-width: 768px) {
      max-width: 80%;
      margin: 0;
      margin-bottom: 40px;
    }
  }

  & ul {
    max-width: 100%;
    list-style: none;
    min-width: 250px;
    padding-left: 0;
    margin: 0;

    & > li {
      text-align: left;
      padding: 2px 0;
    }
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
      <Title
        style={{
          marginTop: 50,
        }}
      >
        React Hook Form
      </Title>
      <ImgSection>
        <ul>
          <li>No. of mount: 1</li>
          <li>No. of committing change: 1</li>
          <li style={{ fontWeight: 'bold' }}>
            Total time:{' '}
            <span
              style={{
                color: colors.lightPink,
              }}
            >
              1800ms
            </span>
          </li>
        </ul>
        <SimpleImg src={hookFrom} placeholder={false} alt="React Hook Form performance" />
      </ImgSection>
      <Title>Formik</Title>
      <ImgSection>
        <ul>
          <li>No. of mount: 6</li>
          <li>No. of committing change: 1</li>
          <li style={{ fontWeight: 'bold' }}>
            Total time:{' '}
            <span
              style={{
                color: colors.lightPink,
              }}
            >
              2070ms
            </span>
          </li>
        </ul>
        <SimpleImg src={formik} placeholder={false} alt="Formik performance" />
      </ImgSection>
      <Title>Redux Form</Title>
      <ImgSection>
        <ul>
          <li>No. of mount: 17</li>
          <li>No. of committing change: 2</li>
          <li>No. of update: 2</li>
          <li style={{ fontWeight: 'bold' }}>
            Total time:{' '}
            <span
              style={{
                color: colors.lightPink,
              }}
            >
              2380ms
            </span>
          </li>
        </ul>
        <SimpleImg src={reduxForm} placeholder={false} alt="Redux Form performance" />
      </ImgSection>

      <p style={{ marginBottom: 40 }}>
        <span style={{ fontSize: 20 }}>⚠</span> Wants to see more intense performance test?{' '}
        <Link href="https://github.com/bluebill1049/react-hook-form-performance-compare">
          Check out the result for 1000 fields within a form here
        </Link>
        .
      </p>
    </Wrapper>
  );
}
