import styled from 'styled-components';
import colors from './colors';

export const SubHeading = styled.p`
  margin-bottom: 40px;
  color: ${colors.lightPink};
  text-align: center;
`;

export const Heading = styled.h1`
  font-weight: 100;
  font-size: 55px;
  margin-bottom: 10px;
  text-align: center;
`;

export const Title = styled.h2`
  text-align: center;
  font-weight: 200;

  &:before,
  &:after {
    background-color: #4f6294;
    content: '';
    display: inline-block;
    height: 1px;
    position: relative;
    vertical-align: middle;
    width: 35%;
  }

  &:before {
    right: 0.5em;
    margin-left: -50%;
  }

  &:after {
    left: 0.5em;
    margin-right: -50%;
  }
`;

export const Error = styled.p`
  font-size: 12px;
  color: ${colors.lightPink};
`
