import React, { useState, useRef, Suspense, useEffect } from 'react';
import useForm from 'react-forme';
import { Animate } from 'react-simple-animate';
import { SubHeading, Heading, Title } from './styles/typography';
import ButtonGroup from './ButtonGroup';
import styled from 'styled-components';
import FORM_DATA from './constants/formData';
import colors from './styles/colors';
import Home from './Home';

const Setting = React.lazy(() => import('./Setting'));
const Builder = React.lazy(() => import('./Builder'));
const Api = React.lazy(() => import('./Api'));

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
  margin: 0 auto 0;

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

const Root = styled.div`
  overflow: hidden;
  color: white;
  padding: 0 20px 50px;
  position: relative;

  @media (min-width: 1024px) {
    padding: 0 50px;
  }

  & form > select,
  & form > input {
    display: block;
    box-sizing: border-box;
    width: 100%;
    border-radius: 4px;
    padding: 10px 15px;
    margin-bottom: 10px;
    font-size: 16px;
  }

  & form > select {
    width: 100%;
  }

  & form > select:not([multiple]) {
    height: 37px;
  }

  & form {
    flex: 1;
  }

  & form > input.form-error {
    border: 1px solid #bf1650;
  }
`;

const Footer = styled.footer`
  padding: 40px 0;
  font-size: 12px;
  font-weight: 200;

  @media (min-width: 768px) {
    font-size: 16px;
  }

  & > a {
    color: white;
    text-decoration: none;
    transition: 0.3s all;

    &:hover {
      color: ${colors.lightPink};
    }
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

const isMobile = window.matchMedia('(max-width: 768px)').matches;

function App() {
  const [submitData, updateSubmitData] = useState({});
  const settingButton = useRef(null);
  const builderButton = useRef(null);
  const apiButton = useRef(null);
  const [editFormData, setFormData] = useState({});
  const HomeRef = useRef(null);
  const [showSetting, toggleSetting] = useState(false);
  const [showApi, toggleApi] = useState(false);
  const [showBuilder, toggleBuilder] = useState(false);
  const [formData, updateFormData] = useState(FORM_DATA);
  const [setting, setConfig] = useState<{
    mode: 'onSubmit' | 'onBlur' | 'onChange';
    showError: boolean;
    showWatch: boolean;
    showSubmit: boolean;
  }>({
    mode: 'onChange',
    showError: true,
    showWatch: true,
    showSubmit: true,
  });
  const { register, errors, handleSubmit, watch } = useForm({
    mode: setting.mode,
  });

  const onSubmit = data => {
    updateSubmitData(data);
  };

  useEffect(
    () => {
      const pathName = window.location.pathname;
      if (pathName === '/api') {
        toggleApi(true);
        toggleBuilder(false);
      } else if (pathName === '/builder') {
        toggleApi(false);
        toggleBuilder(true);
      }
    },
    [window.location.pathname],
  );

  const Buttons = (
    <ButtonGroup
      builderButton={builderButton}
      toggleBuilder={toggleBuilder}
      toggleSetting={toggleSetting}
      showSetting={showSetting}
      settingButton={settingButton}
      showBuilder={showBuilder}
      apiButton={apiButton}
      showApi={showApi}
      toggleApi={toggleApi}
    />
  );

  return (
    <Root>
      {!isMobile && Buttons}

      <Suspense fallback={<span />}>
        <Setting
          settingButton={settingButton}
          toggleSetting={toggleSetting}
          setting={setting}
          showSetting={showSetting}
          setConfig={setConfig}
        />
      </Suspense>

      <Suspense fallback={<span />}>
        <Builder
          showBuilder={showBuilder}
          toggleBuilder={toggleBuilder}
          editFormData={editFormData}
          setFormData={setFormData}
          formData={formData}
          updateFormData={updateFormData}
          builderButton={builderButton}
          isMobile={isMobile}
          HomeRef={HomeRef}
        />
      </Suspense>

      <Suspense fallback={<span />}>
        <Api
          showApi={showApi}
          toggleApi={toggleApi}
          editFormData={editFormData}
          setFormData={setFormData}
          formData={formData}
          updateFormData={updateFormData}
          builderButton={builderButton}
          isMobile={isMobile}
          apiButton={apiButton}
        />
      </Suspense>

      {isMobile && Buttons}

      <main
        onClick={() => {
          if (showSetting || showBuilder) {
            toggleSetting(false);
            toggleBuilder(false);
          }
        }}
        style={{
          perspective: '800px',
        }}
      >
        <Animate
          play={showBuilder || showSetting || showApi}
          startStyle={{ minHeight: '100vh', filter: 'blur(0)', transform: 'scale(1)' }}
          endStyle={{ minHeight: '100vh', filter: 'blur(3px)', transform: 'scale(0.9) rotateX(5deg)' }}
        >
          <Head>
            <Logo viewBox="0 0 100 100">
              <path d="M73.56,13.32H58.14a8.54,8.54,0,0,0-16.27,0H26.44a11,11,0,0,0-11,11V81.63a11,11,0,0,0,11,11H73.56a11,11,0,0,0,11-11V24.32A11,11,0,0,0,73.56,13.32Zm-30.92,2a1,1,0,0,0,1-.79,6.54,6.54,0,0,1,12.78,0,1,1,0,0,0,1,.79h5.38v6.55a3,3,0,0,1-3,3H40.25a3,3,0,0,1-3-3V15.32ZM82.56,81.63a9,9,0,0,1-9,9H26.44a9,9,0,0,1-9-9V24.32a9,9,0,0,1,9-9h8.81v6.55a5,5,0,0,0,5,5h19.5a5,5,0,0,0,5-5V15.32h8.81a9,9,0,0,1,9,9Z" />
              <path style={{ transform: 'translateX(-25px)' }} d="M71.6,45.92H54a1,1,0,0,0,0,2H71.6a1,1,0,0,0,0-2Z" />
              <path d="M71.6,45.92H54a1,1,0,0,0,0,2H71.6a1,1,0,0,0,0-2Z" />
              <path
                style={{ transform: 'translateX(-25px)' }}
                d="M71.1,69.49H53.45a1,1,0,1,0,0,2H71.1a1,1,0,0,0,0-2Z"
              />
              <path d="M71.1,69.49H53.45a1,1,0,1,0,0,2H71.1a1,1,0,0,0,0-2Z" />
            </Logo>
            <Heading>React Forme</Heading>
            <SubHeading>Performance, flexible and extensible forms with easy to use for validation.</SubHeading>

            <HeadingButtons>
              <button
                onClick={() => {
                  if (HomeRef.current) {
                    // @ts-ignore
                    HomeRef.current.scrollIntoView({ behavior: 'smooth' });
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
                <p>Leverage your existing html markup and start validation your forms with standard validation.</p>
              </div>

              <div>
                <h3>Super Light</h3>
                <p>
                  Performance is important, and pack size matters. it is only 2k gzipped and without any dependencies.
                </p>
              </div>

              <div>
                <h3>Performance</h3>
                <p>
                  Minimises the volume that is triggered with component re-rendering, try to provide your users with the
                  best experience.
                </p>
              </div>

              <div>
                <h3>Adoptable</h3>
                <p>Since form state is inherently local, it can be easily adopted without other dependency.</p>
              </div>
            </FeaturesContent>
          </Features>

          <div ref={HomeRef}>
            <Home
              {...{
                handleSubmit,
                onSubmit,
                submitData,
                register,
                errors,
                watch,
                formData,
                toggleBuilder,
                setting,
              }}
            />
          </div>

          <Footer>
            Build ♡ by <a href="https://twitter.com/bluebill1049">@Bill Luo</a> with{' '}
            <a href="https://react-forme.now.sh/" target="_blank">
              React Forme
            </a>{' '}
            &{' '}
            <a href="https://react-simple-animate.now.sh/" target="_blank">
              React Simple Animate
            </a>
          </Footer>
        </Animate>
      </main>
    </Root>
  );
}

export default React.memo(App);
