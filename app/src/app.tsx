import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Basic from './basic';
import Watch from './watch';
import basicSchemaValidation from './basicSchemaValidation';

const App: React.FC = () => {
  return (
    <Router>
      <Route path="/" exact component={Basic} />
      <Route path="/watch" exact component={Watch} />
      <Route path="/basicSchemaValidation" exact component={basicSchemaValidation} />
    </Router>
  );
};

export default App;
