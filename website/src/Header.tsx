import { Heading, SubHeading } from './styles/typography';
import React from 'react';
import styled from 'styled-components';
import colors from './styles/colors';
import { AnimateGroup, Animate } from 'react-simple-animate';
import video from './assets/react-hook-form-demo-video.mp4';
import FeaturesList from './FeaturesList';
import track from "./utils/track";

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

export const HeadingButtons = styled.div`
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

const Video = styled.video`
  width: 100%;
  border-radius: 10px;
  display: block;
  box-shadow: 0px 0 9px 0px #010817;
  margin-bottom: 100px;
  margin-top: -45px;
  background: ${colors.primary};

  @media (min-width: 768px) {
    width: 700px;
    height: 491px;
    margin: 0 auto 40px;
  }
`;

export default function Header({ homeRef, toggleApi, tabIndex }: any) {
  // @ts-ignore
  return (
    <AnimateGroup play>
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
            tabIndex={tabIndex}
            onClick={() => {
              track({
                category: 'Home CTA',
                label: 'Demo',
                action: 'go to demo'
              })
              if (homeRef.current) {
                // @ts-ignore
                homeRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Demo
          </button>
          <button
            tabIndex={tabIndex}
            onClick={() => {
              toggleApi(true);
              track({
                category: 'Home CTA',
                label: 'API',
                action: 'go to API'
              })
              document.title = 'React hook form - API';
              window.history.pushState({ page: 'React hook form - API' }, 'React hook form - API', '/api');
            }}
          >
            Get Started
          </button>
        </HeadingButtons>
      </Head>

      <Video controls autoPlay playsInline muted onClick={() => {
        track({
          category: 'video',
          label: 'video',
          action: 'play/pause video'
        })
      }}>
        <source src={video} type="video/mp4" />
      </Video>

      <FeaturesList />
    </AnimateGroup>
  );
}
