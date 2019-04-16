import { Heading, SubHeading, Title } from './styles/typography';
import React from 'react';
import styled from 'styled-components';
import colors from './styles/colors';

const Logo = styled.svg`
  height: 80px;
  fill: white;
  top: 0;
  left: 0;
  background: #333;
  padding: 20px;
  border-radius: 15px;
  background: ${colors.lightPink};
  text-align: center;
  display: block;
  margin: -50px auto 0;

  @media (min-width: 768px) {
    display: none;
  }
`;

const Head = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;

  @media (min-width: 768px) {
    height: auto;
  }

  & > h1 {
    font-size: 40px;
    text-shadow: 2px 2px 4px ${colors.lightBlue};

    @media (min-width: 768px) {
      font-size: 65px;
    }
  }

  & > p {
    font-size: 16px;
    font-weight: 100;
  }
`;

const Features = styled.div`
  margin-top: -60px;

  @media (min-width: 768px) {
    margin-top: 0;
  }

  & > h2 {
    margin-bottom: 30px;

    @media (min-width: 768px) {
      max-width: 400px;
      margin: 0 auto;
      margin-bottom: 20px;
    }
  }
`;

const FeaturesContent = styled.div`
  & h3 {
    font-weight: 400;
    font-size: 16px;
    text-align: center;
  }

  & p {
    font-size: 14px;
    margin-bottom: 30px;
  }

  @media (min-width: 768px) {
    & h3 {
      font-size: 22px;
    }

    & p {
      text-align: center;
      font-size: 16px;
    }

    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-column-gap: 25px;
    max-width: 1010px;
    margin: 20px auto;
  }
`;

const HeadingButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-column-gap: 20px;
  margin-top: 10px;

  @media (min-width: 768px) {
    grid-column-gap: 40px;
  }

  & > button {
    display: block;
    box-sizing: border-box;
    width: 100%;
    border-radius: 4px;
    padding: 9px 20px;
    margin-bottom: 10px;
    font-size: 14px;
    background: ${colors.primary};
    color: white;
    border: 1px solid ${colors.lightBlue};
    transition: 0.3s all;

    &:hover {
      opacity: 0.8;
    }

    &:active {
      background: ${colors.lightPink};
    }

    @media (min-width: 768px) {
      font-size: 20px;
      padding: 12px 20px;
      font-weight: 300;
      margin-bottom: 40px;
    }
  }
`;

export default function Header({ homeRef, toggleApi }: any) {
  return (
    <>
      <Head>
        <Logo viewBox="0 0 100 100">
          <path d="M73.56,13.32H58.14a8.54,8.54,0,0,0-16.27,0H26.44a11,11,0,0,0-11,11V81.63a11,11,0,0,0,11,11H73.56a11,11,0,0,0,11-11V24.32A11,11,0,0,0,73.56,13.32Zm-30.92,2a1,1,0,0,0,1-.79,6.54,6.54,0,0,1,12.78,0,1,1,0,0,0,1,.79h5.38v6.55a3,3,0,0,1-3,3H40.25a3,3,0,0,1-3-3V15.32ZM82.56,81.63a9,9,0,0,1-9,9H26.44a9,9,0,0,1-9-9V24.32a9,9,0,0,1,9-9h8.81v6.55a5,5,0,0,0,5,5h19.5a5,5,0,0,0,5-5V15.32h8.81a9,9,0,0,1,9,9Z" />
          <path style={{ transform: 'translateX(-25px)' }} d="M71.6,45.92H54a1,1,0,0,0,0,2H71.6a1,1,0,0,0,0-2Z" />
          <path d="M71.6,45.92H54a1,1,0,0,0,0,2H71.6a1,1,0,0,0,0-2Z" />
          <path style={{ transform: 'translateX(-25px)' }} d="M71.1,69.49H53.45a1,1,0,1,0,0,2H71.1a1,1,0,0,0,0-2Z" />
          <path d="M71.1,69.49H53.45a1,1,0,1,0,0,2H71.1a1,1,0,0,0,0-2Z" />
        </Logo>
        <Heading>React Hook Form</Heading>
        <SubHeading>Performance, flexible and extensible forms with easy to use for validation.</SubHeading>

        <HeadingButtons>
          <button
            onClick={() => {
              if (homeRef.current) {
                // @ts-ignore
                homeRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Demo
          </button>
          <button
            onClick={() => {
              toggleApi(true);
              document.title = 'React hook form - API';
              window.history.pushState({ page: 'React hook form - API' }, 'React hook form - API', '/api');
            }}
          >
            Get Started
          </button>
        </HeadingButtons>
      </Head>

      <Features>
        <Title>Why?</Title>
        <FeaturesContent>
          <div>
            <h3>HTML standard</h3>
            <p>Leverage your existing HTML markup, and start validating your forms with standard validation.</p>
          </div>

          <div>
            <h3>Super Light</h3>
            <p>
              Performance is important and packages size matters. it is tiny and without any dependencies.
            </p>
          </div>

          <div>
            <h3>Performance</h3>
            <p>
              Minimizes the volume that is triggered re-rendering, try to provide your users with the best experience.
            </p>
          </div>

          <div>
            <h3>Adoptable</h3>
            <p>Since form state is inherently local, it can be easily adopted without other dependencies.</p>
          </div>
        </FeaturesContent>
      </Features>
    </>
  );
}
