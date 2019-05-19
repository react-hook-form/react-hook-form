import React from 'react';
import { Title } from './styles/typography';
import colors from './styles/colors';
import styled from 'styled-components';
import track from "./utils/track";

const Menu = styled.div`
  display: none;
  position: relative;

  @media (min-width: 768px) {
    display: block;

    & > ul {
      position: fixed;
      list-style: none;
      padding: 0;

      & > li:first-child > button {
        font-size: 1.5rem;
      }

      & > li {
        line-height: 22px;
        padding-bottom: 15px;
        font-size: 18px;

        & > a {
          text-decoration: none;
          padding-left: 10px;
        }

        & > a,
        & > button {
          font-size: inherit;
          color: white;
          text-decoration: none;
          transition: 0.3s all;
          background: none;
          border: none;
          cursor: pointer;
          border-bottom: 1px solid transparent;

          &:hover {
            border-bottom: 1px solid ${colors.lightPink};
          }
        }
      }
    }
  }
`;

const Arrow = styled.span`
  top: -1px;
  position: relative;
  color: #ec5990;

  ${props =>
    props.last
      ? `
  :before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 50%;
    border-left: 1px solid #ec5990;
  }
  `
      : ''}
`;

const Code = styled.span`
  color: ${colors.lightPink};
  position: relative;
  top: -4px;
  font-size: 14px;
`;

export default function ApiMenu({ links, goToSection, tabIndex }: any) {
  return (
    <Menu>
      <ul>
        {links.map((link, index) => {
          if (link === 'Examples') {
            return (
              <React.Fragment key="examples">
                <li>
                  <Code>{`</>`}</Code>
                  <a onClick={() => {
                    track({
                      category: 'API',
                      label: 'Examples',
                      action: 'go to examples'
                    })
                  }} href="https://github.com/bluebill1049/react-hook-form/tree/master/examples" target="_blank" tabIndex={tabIndex}>
                    Examples
                  </a>
                </li>
                <li>
                  <Title
                    style={{
                      marginBottom: '10px',
                      fontSize: 16,
                      color: colors.lightBlue,
                    }}
                  >
                    API
                  </Title>
                </li>
              </React.Fragment>
            );
          }
          return (
            <li
              key={link}
              onClick={() => goToSection(link)}
              style={{
                ...(index > 2
                  ? {
                      marginLeft: 10,
                      ...(index !== links.length - 1 ? { borderLeft: '1px solid #ec5990' } : null),
                      ...(index === 3 ? { paddingTop: 10, marginTop: -15 } : null),
                    }
                  : null),
              }}
            >
              <Arrow last={index === links.length - 1}>
                {index > 2 && (
                  <span
                    style={{
                      left: 1,
                      position: 'relative',
                    }}
                  >
                    ╴
                  </span>
                )}
              </Arrow>
              {link !== 'Quick Start' && <Code>{`</>`}</Code>}{' '}
              <button
                tabIndex={tabIndex}
                style={{
                  top: '-3px',
                  position: 'relative',
                  ...(link === 'Quick Start' ? { paddingLeft: 0 } : null),
                }}
              >
                {link}
              </button>
            </li>
          );
        })}
      </ul>
    </Menu>
  );
}
