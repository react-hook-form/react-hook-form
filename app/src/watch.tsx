import React from 'react';
import useForm from 'react-hook-form';

const Basic: React.FC = () => {
  const { register, handleSubmit, watch } = useForm();
  const onSubmit = () => {};
  const test = watch('test');
  const testObject = watch('testObject');
  const testSingle = watch('testSingle');
  const testArray = watch(['test[0]', 'test[1]']);
  const toggle = watch('toggle');
  const watchAll = watch();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input name="testSingle" ref={register} placeholder="testSingle" />
      {testSingle === 'testSingle' && <div id="HideTestSingle">Hide Content TestSingle</div>}

      <input name="test[0]" ref={register} placeholder="test[0]" />
      <input name="test[1]" ref={register} placeholder="test[1]" />

      <div id="testData">{JSON.stringify(test)}</div>
      <div id="testArray">{JSON.stringify(testArray)}</div>

      <input name="testObject.firstName" ref={register} placeholder="testObject.firstName" />
      <input name="testObject.lastName" ref={register} placeholder="testObject.lastName" />

      <div id="testObject">{JSON.stringify(testObject)}</div>

      <input type="checkbox" name="toggle" ref={register} />
      {toggle && <div id="hideContent">Hide Content</div>}

      <div id="watchAll">{JSON.stringify(watchAll)}</div>

      <button>Submit</button>
    </form>
  );
};

export default Basic;
