import styled from 'styled-components';
import colors from './colors';

export const SubHeading = styled.p`
  font-size: 13px;
  padding: 0 20px;
  margin-top: 0;
  text-align: center;
  color: ${colors.lightPink};

  @media (min-width: 768px) {
    font-size: 16px;
    margin-bottom: 40px;
  }
`;

export const Heading = styled.h1`
  font-weight: 100;
  text-align: center;
  margin-bottom: 10px;

  @media (min-width: 768px) {
    font-size: 55px;
    margin-bottom: 20px;
  }
`;

export const HeadingWithTopMargin = styled(Heading)`
  @media (min-width: 768px) {
    margin-top: 130px;
  }
`;

export const Title = styled.h2`
  text-align: center;
  font-weight: 200;
  margin-top: 10px;
  font-size: 1.1rem;
  overflow: hidden;
  margin-bottom: 30px;
  
  @media (min-width: 768px) {
    margin-top: 20px;
    font-size: 1.5rem;
  }

  &:before,
  &:after {
    background-color: #4f6294;
    content: '';
    display: inline-block;
    height: 1px;
    position: relative;
    vertical-align: middle;
    width: 50%;
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
`;
