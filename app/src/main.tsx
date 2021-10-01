import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';

const container = document.getElementById('root');
ReactDOM.render(<App />, container);
// @ts-ignore
const root = ReactDOM.createRoot(container);
root.render(<App />);
