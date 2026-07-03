import '../../app/src/style.css';

import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import AutoUnregister from '../../app/src/autoUnregister';
import Basic from '../../app/src/basic';
import BasicSchemaValidation from '../../app/src/basicSchemaValidation';
import ConditionalField from '../../app/src/conditionalField';
import Controller from '../../app/src/controller';
import CustomSchemaValidation from '../../app/src/customSchemaValidation';
import DefaultValues from '../../app/src/defaultValues';
import DefaultValuesAsync from '../../app/src/defaultValuesAsync';
import { DelayError } from '../../app/src/delayError';
import FormState from '../../app/src/formState';
import FormStateWithNestedFields from '../../app/src/formStateWithNestedFields';
import FormStateWithSchema from '../../app/src/formStateWithSchema';
import IsValid from '../../app/src/isValid';
import ManualRegisterForm from '../../app/src/manualRegisterForm';
import Reset from '../../app/src/reset';
import ResetKeepDirty from '../../app/src/resetKeepDirty';
import ReValidateMode from '../../app/src/reValidateMode';
import SetError from '../../app/src/setError';
import SetFocus from '../../app/src/setFocus';
import SetValue from '../../app/src/setValue';
import SetValueCustomRegister from '../../app/src/setValueCustomRegister';
import SetValueAsyncStrictMode from '../../app/src/setValueStrictMode';
import SetValueWithSchema from '../../app/src/setValueWithSchema';
import SetValueWithTrigger from '../../app/src/setValueWithTrigger';
import TriggerValidation from '../../app/src/triggerValidation';
import UseFieldArray from '../../app/src/useFieldArray';
import UseFieldArrayNested from '../../app/src/useFieldArrayNested';
import UseFieldArrayUnregister from '../../app/src/useFieldArrayUnregister';
import { UseFormState } from '../../app/src/useFormState';
import UseWatch from '../../app/src/useWatch';
import UseWatchUseFieldArrayNested from '../../app/src/useWatchUseFieldArrayNested';
import ValidateFieldCriteria from '../../app/src/validateFieldCriteria';
import Watch from '../../app/src/watch';
import WatchDefaultValues from '../../app/src/watchDefaultValues';
import WatchFieldArray from '../../app/src/watchUseFieldArray';
import WatchUseFieldArrayNested from '../../app/src/watchUseFieldArrayNested';

export function AppRoutes() {
  return (
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
      <Route path="/delayError" element={<DelayError />} />
      <Route path="/setFocus" element={<SetFocus />} />
      <Route path="/setValueWithTrigger" element={<SetValueWithTrigger />} />
      <Route path="/conditionalField" element={<ConditionalField />} />
      <Route path="/UseFieldArray/:mode" element={<UseFieldArray />} />
      <Route
        path="/UseFieldArrayUnregister"
        element={<UseFieldArrayUnregister />}
      />
      <Route path="/useFieldArray/:mode" element={<UseFieldArray />} />
      <Route path="/reset" element={<Reset />} />
      <Route path="/resetKeepDirty" element={<ResetKeepDirty />} />
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
      <Route path="/default-values-async" element={<DefaultValuesAsync />} />
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
    </Routes>
  );
}

export function AppRoutesAt(path: string) {
  return (
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  );
}
