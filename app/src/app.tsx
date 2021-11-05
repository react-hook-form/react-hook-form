import * as React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AutoUnregister from './autoUnregister';
import Basic from './basic';
import Watch from './watch';
import BasicSchemaValidation from './basicSchemaValidation';
import SetError from './setError';
import SetValue from './setValue';
import FormState from './formState';
import ManualRegisterForm from './manualRegisterForm';
import DefaultValues from './defaultValues';
import WatchDefaultValues from './watchDefaultValues';
import Reset from './reset';
import TriggerValidation from './triggerValidation';
import ReValidateMode from './reValidateMode';
import ValidateFieldCriteria from './validateFieldCriteria';
import SetValueCustomRegister from './setValueCustomRegister';
import ConditionalField from './conditionalField';
import FormStateWithSchema from './formStateWithSchema';
import SetValueWithSchema from './setValueWithSchema';
import SetValueWithTrigger from './setValueWithTrigger';
import IsValid from './isValid';
import Controller from './controller';
import UseFieldArray from './useFieldArray';
import UseFieldArrayNested from './useFieldArrayNested';
import CustomSchemaValidation from './customSchemaValidation';
import WatchFieldArray from './watchUseFieldArray';
import UseWatch from './useWatch';
import FormStateWithNestedFields from './formStateWithNestedFields';
import UseFieldArrayUnregister from './useFieldArrayUnregister';
import WatchUseFieldArrayNested from './watchUseFieldArrayNested';
import UseWatchUseFieldArrayNested from './useWatchUseFieldArrayNested';
import Test from './test';
import Welcome from './welcome';
import { UseFormState } from './useFormState';
import SetValueAsyncStrictMode from './setValueStrictMode';
import './style.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/basic/:mode" element={<Basic />} />
        <Route
          path="/validate-field-criteria"
          element={<ValidateFieldCriteria />}
        />
        <Route path="/controller/:mode" element={<Controller />} />
        <Route
          path="/re-validate-mode/:mode/:reValidateMode"
          element={<ReValidateMode />}
        />
        <Route path="/manual-register-form" element={<ManualRegisterForm />} />
        <Route path="/watch" element={<Watch />} />
        <Route
          path="/basic-schema-validation/:mode"
          element={<BasicSchemaValidation />}
        />
        <Route path="/setError" element={<SetError />} />
        <Route path="/setValueWithTrigger" element={<SetValueWithTrigger />} />
        <Route path="/conditionalField" element={<ConditionalField />} />
        <Route path="/UseFieldArray/:mode" element={<UseFieldArray />} />
        <Route
          path="/UseFieldArrayUnregister"
          element={<UseFieldArrayUnregister />}
        />
        <Route path="/reset" element={<Reset />} />
        <Route path="/setValue" element={<SetValue />} />
        <Route
          path="/setValueAsyncStrictMode"
          element={<SetValueAsyncStrictMode />}
        />
        <Route path="/setValueWithSchema" element={<SetValueWithSchema />} />
        <Route
          path="/SetValueCustomRegister"
          element={<SetValueCustomRegister />}
        />
        <Route path="/formState/:mode" element={<FormState />} />
        <Route
          path="/formStateWithNestedFields/:mode"
          element={<FormStateWithNestedFields />}
        />
        <Route
          path="/formStateWithSchema/:mode"
          element={<FormStateWithSchema />}
        />
        <Route path="/isValid/:mode/:defaultValues" element={<IsValid />} />
        <Route path="/default-values" element={<DefaultValues />} />
        <Route path="/trigger-validation" element={<TriggerValidation />} />
        <Route path="/watch-default-values" element={<WatchDefaultValues />} />
        <Route path="/watch-field-array/:mode" element={<WatchFieldArray />} />
        <Route
          path="/customSchemaValidation/:mode"
          element={<CustomSchemaValidation />}
        />
        <Route path="/autoUnregister" element={<AutoUnregister />} />
        <Route path="/useWatch" element={<UseWatch />} />
        <Route path="/useFormState" element={<UseFormState />} />
        <Route path="/useFieldArrayNested" element={<UseFieldArrayNested />} />
        <Route
          path="/watchUseFieldArrayNested"
          element={<WatchUseFieldArrayNested />}
        />
        <Route
          path="/useWatchUseFieldArrayNested"
          element={<UseWatchUseFieldArrayNested />}
        />
        <Route path="/test" element={<Test />} />
        <Route path="/" element={<Welcome />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
