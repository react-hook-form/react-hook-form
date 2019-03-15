import React, { useState, useRef, useEffect } from 'react';
import { Animate } from 'react-simple-animate';
import SyntaxHighlighter from 'react-syntax-highlighter';
import useForm from './src';
import { monokaiSublime } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import generateCode from './logic/generateCode';
import styled from 'styled-components';
import colors from './styles/colors';
import SortableContainer from './SortableContainer';
import copyClipBoard from './utils/copyClipBoard';
import { SubHeading, Heading, Error, Title } from './styles/typography';

const Root = styled.main`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vw;
  background: #0e101c;
  z-index: 4;
  color: white;

  & pre,
  & code {
    font-size: 14px;
    text-align: left;
    color: white;
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
    background: none !important;
  }
`;

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 500px 1fr;
  grid-column-gap: 60px;
`;

const SubmitButton = styled.input`
  margin-top: 30px;
  height: 55px;
  text-transform: uppercase;
  letter-spacing: 0.5rem;
  background: ${props => props.background || colors.lightPink};
  color: ${props => props.color || 'white'};
  border: none;
`;

const Form = styled.form`
  & fieldset {
    border-radius: 4px;
    border: 1px solid #6a6b7f;
    display: flex;
    padding: 10px 20px;
  }

  & fieldset > input {
    display: block;
    box-sizing: border-box;
    width: 100%;
    border-radius: 4px;
    border: none;
    padding: 10px 15px;
    margin-bottom: 10px;
    font-size: 14px;
  }

  & label {
    line-height: 2;
    text-align: left;
    display: block;
    margin-bottom: 13px;
    margin-top: 20px;
  }
`;

const CopyButton = styled.button`
  background: ${colors.lightBlue};
  border: none;
  color: white;
  border-radius: 4px;
  font-size: 16px;
  padding: 5px 10px;
  display: inline-block;
  position: absolute;
  bottom: 20px;
  right: 40px;

  &:hover {
    transition: 0.3s all;
    opacity: 0.8;
  }

  &:active {
    transition: 0.3s all;
    transform: translateY(2px);
  }
`;

function Builder({ formData, updateFormData, showBuilder, toggleBuilder, editFormData, setFormData }) {
  const { register, handleSubmit, errors = {}, watch } = useForm();
  const [editIndex, setEditIndex] = useState(-1);
  const copyFormData = useRef([]);
  const closeButton = useRef(null);
  const [showValidation, toggleValidation] = useState(false);
  const onSubmit = (data, event) => {
    // @ts-ignore
    updateFormData([...formData, ...[data]]);
    event.target.reset();
  };
  const type = watch('type');
  copyFormData.current = formData;

  function custom(value) {
    return !copyFormData.current.find(data => data[name] === value);
  }

  useEffect(
    () => {
      if (showBuilder && closeButton.current) {
        // @ts-ignore
        closeButton.current.focus();
      }
    },
    [showBuilder],
  );

  return (
    <Animate
      play={showBuilder}
      type="ease-in"
      durationSeconds={0.8}
      startStyle={{
        transform: 'translateY(100%)',
      }}
      endStyle={{
        transform: 'translateY(0)',
      }}
      render={({ style }) => {
        return (
          <Root style={style}>
            <div
              style={{
                overflow: 'auto',
                height: '100vh',
              }}
            >
              <button
                style={{
                  position: 'absolute',
                  fontSize: 35,
                  padding: 20,
                  right: 20,
                  top: 15,
                  color: 'white',
                  cursor: 'pointer',
                  border: 'none',
                  fontWeight: 200,
                  zIndex: 5,
                  background: colors.primary,
                  borderRadius: 10,
                }}
                ref={closeButton}
                tabIndex={0}
                onClick={() => {
                  toggleBuilder(false);
                }}
              >
                &#10005;
              </button>
              <Heading>Builder</Heading>
              <SubHeading>Build your own form with code and example.</SubHeading>

              <Wrapper>
                <div
                  style={{
                    paddingLeft: '20px',
                  }}
                >
                  <Title>Form</Title>

                  <SortableContainer
                    {...{ updateFormData, formData, editIndex, setEditIndex, setFormData, editFormData }}
                  />

                  {formData.length === 0 && (
                    <p
                      style={{
                        textAlign: 'center',
                      }}
                    >
                      You can start adding fields with Fields Creator ▸
                    </p>
                  )}
                </div>

                <Form className="Builder-form" onSubmit={handleSubmit(onSubmit)}>
                  <Title>Field Creator</Title>

                  <label>Name: </label>
                  <input
                    className={errors['name'] && 'form-error'}
                    autoComplete="off"
                    defaultValue={editFormData.name}
                    name="name"
                    ref={ref =>
                      register({
                        ref,
                        required: true,
                        custom,
                      })
                    }
                  />
                  <Animate
                    play={errors['name']}
                    durationSeconds={0.6}
                    startStyle={{
                      maxHeight: 0,
                    }}
                    endStyle={{ maxHeight: 20 }}
                  >
                    {errors['name'] && <Error>This is required.</Error>}
                    {errors['name'] && errors['name']['custom'] && <Error>Name required to be unique.</Error>}
                  </Animate>

                  <label>Type: </label>
                  <select name="type" ref={ref => register({ ref })} value={editFormData.type}>
                    <option value="text">Text</option>
                    <option value="select">Select</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="radio">Radio</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                    <option value="range">Range</option>
                    <option value="search">Search</option>
                    <option value="tel">Tel</option>
                    <option value="url">url</option>
                    <option value="time">Time</option>
                    <option value="datetime">datetime</option>
                    <option value="datetime-local">datetime-local</option>
                    <option value="week">week</option>
                    <option value="month">month</option>
                    <option value="custom" disabled>
                      custom
                    </option>
                  </select>

                  {(type === 'select' ||
                    type === 'radio' ||
                    editFormData.type === 'select' ||
                    editFormData.type === 'radio') &&
                    editFormData.options && (
                      <>
                        <label>Options:</label>
                        <input
                          key={editFormData.name}
                          defaultValue={editFormData.options}
                          type="text"
                          name="options"
                          placeholder="Enter options separate by ;"
                          ref={ref => register({ ref })}
                        />
                      </>
                    )}

                  <label>
                    <input
                      type="checkbox"
                      defaultChecked={editFormData.checkbox}
                      onClick={() => toggleValidation(!showValidation)}
                    />
                    &nbsp; Toggle Validation Panel
                  </label>

                  <Animate
                    play={showValidation}
                    startStyle={{
                      maxHeight: 0,
                      overflow: 'hidden',
                    }}
                    endStyle={{
                      maxHeight: 800,
                      overflow: 'hidden',
                    }}
                  >
                    <label>Validation</label>
                    <fieldset>
                      <label
                        style={{
                          marginTop: 0,
                        }}
                      >
                        <input
                          defaultChecked={editFormData.required}
                          type="checkbox"
                          name="required"
                          ref={ref => register({ ref })}
                        />{' '}
                        required
                      </label>
                      <label defaultValue={editFormData.max}>Max</label>
                      <input name="max" type="number" ref={ref => register({ ref })} />
                      <label defaultValue={editFormData.min}>Min</label>
                      <input name="min" type="number" ref={ref => register({ ref })} />
                      <label defaultValue={editFormData.maxLength}>MaxLength</label>
                      <input name="maxLength" type="number" ref={ref => register({ ref })} />
                      <label defaultValue={editFormData.minLength}>MinLength</label>
                      <input name="minLength" type="number" ref={ref => register({ ref })} />
                      <label>Pattern</label>
                      <input
                        defaultValue={editFormData.pattern}
                        style={{
                          marginBottom: '20px',
                        }}
                        name="pattern"
                        type="text"
                        ref={ref => register({ ref })}
                      />
                    </fieldset>
                  </Animate>

                  <SubmitButton type="submit" value={editIndex >= 0 ? 'Update' : 'Create'} />

                  <h2
                    className="Builder-h2"
                    style={{
                      marginTop: 30,
                      fontSize: 14,
                    }}
                  >
                    or
                  </h2>

                  <Animate
                    play={formData.length > 0}
                    startStyle={{
                      opacity: 0,
                      pointerEvents: 'none',
                    }}
                    endStyle={{
                      opacity: 1,
                      pointerEvents: 'auto',
                    }}
                    render={({ style }) => (
                      <SubmitButton
                        style={style}
                        type="button"
                        color="white"
                        onClick={() => toggleBuilder(false)}
                        background="black"
                        value="Generate From"
                      />
                    )}
                  />
                </Form>

                <div
                  style={{
                    paddingRight: '20px',
                    position: 'relative',
                  }}
                >
                  <Title>Code</Title>

                  <CopyButton
                    onClick={() => {
                      copyClipBoard(generateCode(formData));
                    }}
                  >
                    Copy to clipboard
                  </CopyButton>
                  <SyntaxHighlighter style={monokaiSublime}>{generateCode(formData)}</SyntaxHighlighter>
                </div>
              </Wrapper>
            </div>
          </Root>
        );
      }}
    />
  );
}

export default React.memo(Builder);
