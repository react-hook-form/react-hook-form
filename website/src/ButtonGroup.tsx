import React from 'react';
import styled from 'styled-components';
import colors from './styles/colors';
import { Animate } from 'react-simple-animate';
import Setting from './svgs/setting';
import GitHubButton from 'react-github-btn';
import track from "./utils/track";

const GithubIcon = styled.span`
  position: absolute;
  top: 25px;
  left: 20px;
  transition: 0.3s all;
  z-index: 10;
  max-width: 50px;

  @media (min-width: 768px) {
    right: 20px;
    top: 20px;
  }

  & svg {
    height: 30px;
  }

  &:hover {
    opacity: 0.5;
  }
`;

const MediumIcon = styled(GithubIcon)`
  left: 65px;
`;

const hoverStyle = `
  &:hover {
    > svg {
      transition: 0.3s all;
      fill: ${colors.secondary};
    }

    & > span {
      transition: 0.3s all;
      opacity: 0.6;
    }
  }

  & svg {
    height: 40px;

    @media screen and (min-width: 1024px) {
      height: 50px;
    }
  }
`;

const Button = styled.button`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  background: ${props => (props.active ? 'black' : 'none')};
  color: white;
  border: none;
  margin: 0;
  transition: 0.3s all;

  & > svg {
    fill: white;
  }

  @media (min-width: 768px) {
    background: none;
    color: ${props => (props.active ? colors.lightPink : 'white')};
  }

  ${hoverStyle};
`;

const ActionButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  position: fixed;
  bottom: 0;
  z-index: 5;
  left: 0;
  background: #1e2a4a;
  box-shadow: 0 0 4px 0 #000;
  width: 100%;

  @media (min-width: 768px) {
    z-index: 1;
    position: inherit;
    background: none;
    border: none;
    max-width: 400px;
    margin: 0 auto;
    padding: 15px 0;
    background: ${colors.buttonBlue};
    border-radius: 0 0 15px 15px;
    box-shadow: 0 0 10px 0 #000;
  }
    
  @media (min-width: 1024px) {
    max-width: 470px;
    padding: 15px 10px;
  }

  & > button {
    flex: 1;
    padding: 7px 0;
    font-size: 11px;

    @media (min-width: 768px) {
      font-size: 14px;
      padding: 0;
    }
  }

  & > button {
    border-left: 1px solid ${colors.buttonBlue};

    &:first-child {
      border-left: 0;
    }

    @media (min-width: 768px) {
      border: none;
    }
  }

  & > button > svg {
    width: 23px;
    height: 23px;

    @media (min-width: 768px) {
      width: 40px;
      height: 40px;
    }
  }
`;

const GitHubButtonWrap = styled.span`
  position: absolute;
  right: 20px;
  top: 26px;
`;

export const setHomePage = () => {
  document.title = 'React hook form - Performance, flexible and extensible forms with easy to use for validation.';
  window.history.pushState(
    { page: 'React hook form - Performance, flexible and extensible forms with easy to use for validation.' },
    'React hook form - Performance, flexible and extensible forms with easy to use for validation.',
    '/',
  );
};

export default function ButtonGroup({
  toggleBuilder,
  toggleSetting,
  showSetting,
  showBuilder,
  settingButton,
  builderButton,
  apiButton,
  showApi,
  toggleApi,
  tabIndex,
}) {
  const pathname = window.location.pathname;

  return (
    <>
      <GithubIcon>
        <a onClick={() => {
          track({
            category: 'Github',
            label: 'Github',
            action: 'Go to Github'
          })
        }} href="https://github.com/bluebill1049/react-hook-form" target="_blank" title="React Hook Form Github">
          <svg viewBox="0 0 496 512" height="40" aria-hidden="true" focusable="false" fill="currentColor">
            <path
              fill="white"
              d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
            />
          </svg>
        </a>
      </GithubIcon>
      <MediumIcon>
        <a
          onClick={() =>  {
            track({
              category: 'Medium',
              label: 'Medium',
              action: 'Go to Medium'
            })
          }}
          href="https://medium.com/@bruce1049/form-validation-with-hook-in-3kb-c5414edf7d64"
          target="_blank"
          title="React Form validation under 3K"
        >
          <svg
            viewBox="0 0 512 512"
            height="25"
            aria-hidden="true"
            focusable="false"
            fill="#fff"
            className="Social__StyledIcon-sc-4j9mhd-3 isQvWb sc-EHOje xsqAG"
          >
            <path
              fill="#fff"
              d="M71.5 142.3c.6-5.9-1.7-11.8-6.1-15.8L20.3 72.1V64h140.2l108.4 237.7L364.2 64h133.7v8.1l-38.6 37c-3.3 2.5-5 6.7-4.3 10.8v272c-.7 4.1 1 8.3 4.3 10.8l37.7 37v8.1H307.3v-8.1l39.1-37.9c3.8-3.8 3.8-5 3.8-10.8V171.2L241.5 447.1h-14.7L100.4 171.2v184.9c-1.1 7.8 1.5 15.6 7 21.2l50.8 61.6v8.1h-144v-8L65 377.3c5.4-5.6 7.9-13.5 6.5-21.2V142.3z"
            />
          </svg>
        </a>
      </MediumIcon>

      <GitHubButtonWrap>
        <GitHubButton
          onClick={() =>  {
            track({
              category: 'Github',
              label: 'Github',
              action: 'star repo'
            })
          }}
          href="https://github.com/bluebill1049/react-hook-form"
          data-size="large"
          data-show-count="true"
          aria-label="Star bluebill1049/react-hook-form on GitHub"
        >
          Star
        </GitHubButton>
      </GitHubButtonWrap>

      <ActionButtonGroup>
        <Button
          tabIndex={tabIndex}
          active={pathname === '/'}
          onClick={() => {
            track({
              category: 'mainNav',
              label: 'form',
              action: 'go to Demo'
            })
            toggleApi(false);
            toggleBuilder(false);
            document.title =
              'React hook form - Performance, flexible and extensible forms with easy to use for validation.';
            window.history.pushState(
              { page: 'React hook form - Performance, flexible and extensible forms with easy to use for validation.' },
              'React hook form - Performance, flexible and extensible forms with easy to use for validation.',
              '/',
            );
            window.scrollTo(0, 0);
          }}
          ref={apiButton}
        >
          <svg viewBox="0 10 100 100">
            <path d="M73.56,13.32H58.14a8.54,8.54,0,0,0-16.27,0H26.44a11,11,0,0,0-11,11V81.63a11,11,0,0,0,11,11H73.56a11,11,0,0,0,11-11V24.32A11,11,0,0,0,73.56,13.32Zm-30.92,2a1,1,0,0,0,1-.79,6.54,6.54,0,0,1,12.78,0,1,1,0,0,0,1,.79h5.38v6.55a3,3,0,0,1-3,3H40.25a3,3,0,0,1-3-3V15.32ZM82.56,81.63a9,9,0,0,1-9,9H26.44a9,9,0,0,1-9-9V24.32a9,9,0,0,1,9-9h8.81v6.55a5,5,0,0,0,5,5h19.5a5,5,0,0,0,5-5V15.32h8.81a9,9,0,0,1,9,9Z" />
            <path style={{ transform: 'translateX(-25px)' }} d="M71.6,45.92H54a1,1,0,0,0,0,2H71.6a1,1,0,0,0,0-2Z" />
            <path d="M71.6,45.92H54a1,1,0,0,0,0,2H71.6a1,1,0,0,0,0-2Z" />
            <path style={{ transform: 'translateX(-25px)' }} d="M71.1,69.49H53.45a1,1,0,1,0,0,2H71.1a1,1,0,0,0,0-2Z" />
            <path d="M71.1,69.49H53.45a1,1,0,1,0,0,2H71.1a1,1,0,0,0,0-2Z" />
          </svg>
          <span>Form</span>
        </Button>
        <Button
          tabIndex={tabIndex}
          active={pathname === '/api'}
          onClick={() => {
            toggleBuilder(false);
            if (showApi) {
              toggleApi(false);
              setHomePage();
            } else {
              toggleApi(true);
              track({
                category: 'mainNav',
                label: 'builder',
                action: 'go to API'
              })
              document.title = 'React hook form - API';
              window.history.pushState({ page: 'React hook form - API' }, 'React hook form - API', '/api');
            }

            // @ts-ignore
            document.getElementById('api').scrollTop = 0;
          }}
          ref={apiButton}
        >
          <svg viewBox="0 10 100 100">
            <g>
              <path d="M15.6,84.8h68.8c5.5,0,10-4.5,10-10V32.6v-7.4c0-5.5-4.5-10-10-10H15.6c-5.5,0-10,4.5-10,10v7.4v42.2   C5.6,80.3,10.1,84.8,15.6,84.8z M7.6,25.2c0-4.4,3.6-8,8-8h68.8c4.4,0,8,3.6,8,8v5.4H7.6V25.2z M7.6,32.6h84.8v42.2   c0,4.4-3.6,8-8,8H15.6c-4.4,0-8-3.6-8-8V32.6z" />
              <path d="M14.7,19.6c-2.4,0-4.4,2-4.4,4.4s2,4.4,4.4,4.4s4.4-2,4.4-4.4S17.1,19.6,14.7,19.6z M14.7,26.4c-1.3,0-2.4-1.1-2.4-2.4   s1.1-2.4,2.4-2.4s2.4,1.1,2.4,2.4S16,26.4,14.7,26.4z" />
              <path d="M25,19.6c-2.4,0-4.4,2-4.4,4.4s2,4.4,4.4,4.4c2.4,0,4.4-2,4.4-4.4S27.5,19.6,25,19.6z M25,26.4c-1.3,0-2.4-1.1-2.4-2.4   s1.1-2.4,2.4-2.4s2.4,1.1,2.4,2.4S26.4,26.4,25,26.4z" />
              <path d="M35.4,19.6c-2.4,0-4.4,2-4.4,4.4s2,4.4,4.4,4.4c2.4,0,4.4-2,4.4-4.4S37.8,19.6,35.4,19.6z M35.4,26.4   c-1.3,0-2.4-1.1-2.4-2.4s1.1-2.4,2.4-2.4s2.4,1.1,2.4,2.4S36.7,26.4,35.4,26.4z" />
              <path d="M63.9,70.8c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3l12.8-12.8c0.4-0.4,0.4-1,0-1.4L65.3,43.9c-0.4-0.4-1-0.4-1.4,0   s-0.4,1,0,1.4L76,57.3L63.9,69.4C63.5,69.8,63.5,70.5,63.9,70.8z" />
              <path d="M34.7,70.8c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3c0.4-0.4,0.4-1,0-1.4L24,57.3l12.1-12.1c0.4-0.4,0.4-1,0-1.4   s-1-0.4-1.4,0L21.9,56.6c-0.4,0.4-0.4,1,0,1.4L34.7,70.8z" />
              <path d="M41.4,71.1c0.3,0,0.6-0.2,0.8-0.4l17.2-25.6c0.3-0.5,0.2-1.1-0.3-1.4c-0.5-0.3-1.1-0.2-1.4,0.3L40.6,69.6   c-0.3,0.5-0.2,1.1,0.3,1.4C41,71.1,41.2,71.1,41.4,71.1z" />
            </g>
          </svg>
          <span>API</span>
        </Button>
        <Button
          tabIndex={tabIndex}
          active={pathname === '/builder'}
          onClick={() => {
            toggleApi(false);
            if (showBuilder) {
              toggleBuilder(false);
              setHomePage();
            } else {
              toggleBuilder(true);
              document.title = 'React hook form - Builder';
              window.history.pushState({ page: 'React hook form - Builder' }, 'React hook form - Builder', '/builder');
            }

            // @ts-ignore
            document.getElementById('builder').scrollTop = 0;
          }}
          ref={builderButton}
        >
          <svg viewBox="0 0 100 125">
            <path d="M91.672,79.919c-7.514-7.514-21.246-21.246-32.626-32.635l22.299-22.299l4.778,0.334c0.035,0.002,0.07,0.003,0.104,0.003   c0.539,0,1.041-0.292,1.305-0.769l7.275-13.113c0.324-0.582,0.222-1.308-0.25-1.779l-4.214-4.214   c-0.47-0.471-1.198-0.573-1.779-0.25l-13.113,7.276c-0.507,0.281-0.805,0.831-0.765,1.409l0.334,4.776L52.722,40.96   c-5.698-5.698-10.126-10.127-11.786-11.786c2.262-6.573,0.615-13.862-4.343-18.82c-4.888-4.888-11.999-6.588-18.561-4.438   c-0.023,0.008-0.042,0.02-0.065,0.029c-0.024,0.009-0.045,0.02-0.068,0.03c-0.165,0.072-0.311,0.169-0.435,0.289   c-0.007,0.007-0.016,0.008-0.023,0.015c-0.009,0.009-0.012,0.021-0.02,0.03c-0.122,0.128-0.219,0.274-0.289,0.435   c-0.01,0.022-0.018,0.044-0.026,0.067c-0.059,0.156-0.092,0.321-0.096,0.492c0,0.023,0,0.044,0.001,0.067   c0.003,0.143,0.02,0.286,0.067,0.429c0.008,0.024,0.021,0.044,0.03,0.066c0.009,0.022,0.019,0.043,0.029,0.065   c0.072,0.165,0.169,0.311,0.289,0.435c0.007,0.007,0.009,0.017,0.016,0.024l7.089,7.089c0.676,0.676,1.048,1.573,1.049,2.527   c0.001,0.953-0.37,1.848-1.044,2.522l-3.555,3.555c-1.392,1.391-3.657,1.387-5.049-0.005l-7.089-7.089   c-0.007-0.007-0.016-0.008-0.022-0.015c-0.124-0.12-0.271-0.217-0.436-0.29c-0.023-0.01-0.044-0.021-0.067-0.03   c-0.023-0.009-0.043-0.022-0.066-0.029c-0.141-0.046-0.284-0.063-0.425-0.066c-0.024-0.001-0.047-0.002-0.071-0.001   c-0.17,0.004-0.335,0.037-0.49,0.096c-0.023,0.009-0.044,0.016-0.066,0.026c-0.161,0.07-0.308,0.167-0.436,0.29   c-0.009,0.009-0.021,0.011-0.03,0.02c-0.007,0.007-0.009,0.016-0.015,0.023c-0.12,0.124-0.216,0.27-0.289,0.435   c-0.01,0.024-0.021,0.045-0.03,0.069c-0.009,0.023-0.021,0.043-0.029,0.066c-2.143,6.566-0.443,13.677,4.438,18.559   c3.495,3.494,8.147,5.349,12.891,5.349c1.986,0,3.984-0.346,5.923-1.012l7.518,7.519c-0.131-0.01-0.257-0.038-0.389-0.038   c-1.417,0-2.75,0.552-3.751,1.554L6.56,75.949c-1.003,1.002-1.555,2.335-1.555,3.752c0,1.417,0.552,2.75,1.555,3.752l2.295,2.296   c0.001,0.001,0.001,0.002,0.001,0.002c0.001,0.001,0.002,0.001,0.002,0.001l7.693,7.694C17.554,94.448,18.887,95,20.305,95   c1.418,0,2.751-0.552,3.752-1.554l26.438-26.439c1.003-1.002,1.555-2.335,1.555-3.752c0-0.131-0.028-0.257-0.038-0.387   l29.321,29.34c1.557,1.557,3.603,2.335,5.652,2.335c2.048,0,4.098-0.778,5.662-2.335c1.508-1.507,2.338-3.514,2.338-5.652   c0-2.144-0.831-4.155-2.338-5.662L91.672,79.919z M77.612,20.29c0.007-0.007,0.009-0.017,0.016-0.024   c0.122-0.127,0.219-0.274,0.29-0.437c0.009-0.02,0.019-0.038,0.027-0.058c0.06-0.154,0.091-0.32,0.096-0.492   c0.001-0.025,0.003-0.049,0.002-0.075c0-0.025,0.004-0.048,0.002-0.073l-0.315-4.507l11.298-6.269l2.622,2.623l-6.269,11.298   l-4.507-0.316c-0.025-0.002-0.05,0.003-0.075,0.002c-0.023,0-0.045,0.001-0.068,0.002c-0.172,0.004-0.339,0.036-0.494,0.096   c-0.022,0.008-0.042,0.019-0.064,0.029c-0.159,0.07-0.303,0.165-0.429,0.285c-0.009,0.009-0.021,0.011-0.03,0.02L51.724,50.386   l-2.104-2.104L77.612,20.29z M31.093,37.727c-0.411-0.428-1.054-0.59-1.637-0.352c-5.698,2.312-12.192,1-16.539-3.347   c-3.472-3.473-5.011-8.295-4.293-13.038l5.196,5.197c1.28,1.279,2.96,1.919,4.64,1.919c1.677,0,3.354-0.638,4.63-1.914l3.555-3.555   c1.238-1.238,1.919-2.883,1.918-4.634c-0.001-1.75-0.684-3.397-1.924-4.636l-5.199-5.199c4.741-0.722,9.562,0.818,13.041,4.295   c4.282,4.282,5.612,10.643,3.437,16.277l-1.562,1.572c-0.581,0.584-0.577,1.529,0.007,2.11c0.291,0.29,0.672,0.434,1.052,0.434   c0.384,0,0.767-0.147,1.059-0.441l0.739-0.743c1.872,1.872,6.078,6.078,11.397,11.397l-3.108,3.108   c-0.806-0.771-1.855-1.202-2.973-1.202c-1.152,0-2.235,0.449-3.049,1.263l-0.938,0.938L31.093,37.727z M15.31,87.983l-3.287-3.288   l22.819-22.819c0.878-0.878,2.41-0.878,3.288,0c0.907,0.906,0.907,2.38,0,3.287L15.31,87.983z M48.385,64.897L21.947,91.336   c-0.876,0.876-2.408,0.876-3.284,0l-1.242-1.242l22.82-22.82c2.071-2.07,2.071-5.438,0-7.508c-1.003-1.003-2.336-1.556-3.754-1.556   c-1.419,0-2.752,0.552-3.754,1.556L9.913,82.585l-1.242-1.242c-0.438-0.439-0.68-1.022-0.68-1.642c0-0.62,0.242-1.203,0.68-1.642   l26.438-26.439c0.438-0.438,1.021-0.68,1.641-0.68c0.621,0,1.204,0.241,1.642,0.68l9.993,9.993c0.438,0.438,0.68,1.021,0.68,1.641   C49.065,63.875,48.823,64.458,48.385,64.897z M51.656,56.414l-2.124,2.124l-8.065-8.064l2.125-2.124c0.501-0.5,1.374-0.501,1.876,0   l0.978,0.978c0.003,0.003,0.004,0.008,0.008,0.012l4.214,4.214c0.003,0.003,0.008,0.004,0.012,0.008l0.977,0.978   C52.172,55.056,52.172,55.897,51.656,56.414z M90.538,90.095c-1.961,1.952-5.144,1.953-7.095,0.002L52.828,59.463l0.938-0.938   c1.658-1.658,1.673-4.336,0.061-6.022l3.108-3.108c11.381,11.39,25.113,25.121,32.626,32.635l0.975,0.976   C91.48,83.948,92,85.209,92,86.556C92,87.896,91.48,89.153,90.538,90.095z" />
          </svg>
          <span>Build Form</span>
        </Button>

        <Animate
          start={{ maxWidth: 125, overflow: 'hidden' }}
          end={{ maxWidth: 0, overflow: 'hidden', borderRight: 0 }}
          play={window.location.pathname !== '/'}
          render={({ style }) => (
            <Button
              className="App-setting"
              style={style}
              onClick={() => {
                toggleSetting(!showSetting);
                track({
                  category: 'mainNav',
                  label: 'setting',
                  action: 'go to setting'
                })
              }}
              ref={settingButton}
            >
              <Setting />
              <span>Setting</span>
            </Button>
          )}
        />
      </ActionButtonGroup>
    </>
  );
}
