import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Basic from './basic';
import Watch from './watch';
import BasicSchemaValidation from './basicSchemaValidation';
import SetError from './setError';
import SetValue from './setValue';
import FormState from './formState';

const App: React.FC = () => {
  return (
    <Router>
      <Route path="/" exact component={Basic} />
      <Route path="/watch" exact component={Watch} />
      <Route path="/basicSchemaValidation" exact component={BasicSchemaValidation} />
      <Route path="/setError" exact component={SetError} />
      <Route path="/setValue" exact component={SetValue} />
      <Route path="/formState/:mode" exact component={FormState} />
    </Router>
  );
};

export default App;
