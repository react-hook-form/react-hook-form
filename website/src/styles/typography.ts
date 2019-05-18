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
    margin-bottom: 30px;
  }
`;

export const Heading = styled.h1`
  font-weight: 100;
  text-align: center;
  margin-bottom: 10px;

  @media (min-width: 768px) {
    font-size: 55px !important;
    margin-bottom: 10px;
  }
`;

export const H1 = styled.h1`
  font-size: 24px;
  display: inline-block;
  margin: 40px auto 30px;
  font-weight: 300;
  padding-bottom: 5px;
  border-bottom: 2px solid ${colors.secondary};

  @media (min-width: 768px) {
    font-size: 36px;
  }
`;

export const H5 = styled.h5`
  font-size: 18px;
  text-align: center;
  font-weight: 500;
  border-bottom: 1px solid ${colors.lightPink};
  margin: 0;
  padding-bottom: 8px;
  
  & > code {
    font-size: 18px !important;
  }
`;

export const HeadingWithTopMargin = styled(Heading)`
  @media (min-width: 768px) {
    margin-top: 30px;
  }
`;

export const Title = styled.h2`
  text-align: center;
  font-weight: 200;
  margin-top: 10px;
  font-size: 1.1rem;
  overflow: hidden;
  margin-bottom: 30px;
  position: relative;

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
