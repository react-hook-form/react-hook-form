import React, { useState, useRef, Suspense } from 'react';
import useForm from './src';
import { Animate } from 'react-simple-animate';
import { SubHeading, Heading } from './styles/typography';
import ButtonGroup from './ButtonGroup';
import styled from 'styled-components';
import FORM_DATA from './constants/formData';
import colors from './styles/colors';
import Home from './Home';

const Setting = React.lazy(() => import('./Setting'));
const Builder = React.lazy(() => import('./Builder'));
const Api = React.lazy(() => import('./Api'));

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

const Logo = styled.svg`
  fill: white;
  height: 25px;
  top: 0;
  left: 0;
  background: #333;
  padding: 5px;
  border-radius: 8px;
  margin-right: 10px;
  margin-bottom: -5px;
  background: ${colors.lightPink};

  @media (min-width: 1024px) {
    height: 45px;
    margin-bottom: -15px;
    margin-right: 20px;
    border-radius: 12px;
    padding: 12px;
  }
`;

const isMobile = window.matchMedia('(max-width: 768px)').matches;

function App() {
  const [submitData, updateSubmitData] = useState({});
  const settingButton = useRef(null);
  const builderButton = useRef(null);
  const apiButton = useRef(null);
  const [editFormData, setFormData] = useState({});
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
          <Heading>
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
            React Forme
          </Heading>
          <SubHeading>Performance, flexible and extensible forms with easy to use for validation.</SubHeading>

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
