import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Basic from './basic';

const App: React.FC = () => {
  return (
    <Router>
      <Route path="/" exact component={Basic} />
    </Router>
  );
};

export default App;
