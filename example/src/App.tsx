import React, { useState } from 'react';
import useForm from './src';
import './App.css';

function App() {
  const { register, errors, prepareSubmit, watch } = useForm({
    validateMode: 'onChange'
  });
  const [submitData, updateSubmitData] = useState({});

  const onSubmit = data => {
    updateSubmitData(data);
  };

  return (
    <div className="App">
      <h1>React Forme</h1>
      <div
        style={{
          display: 'flex',
        }}
      >
        <form onSubmit={prepareSubmit(onSubmit)}>
          <input name="input" ref={ref => register({ ref })} />
          <input type="range" name="range" ref={ref => register({ ref })} />
          <input type="date" name="date" ref={ref => register({ ref, required: true })} />
          <input type="datetime-local" name="datetime-local" ref={ref => register({ ref, required: true })} />
          <input type="email" name="email" ref={ref => register({ ref, required: true })} />
          <input name="inputRequired"  placeholder="input required" ref={ref => register({ ref, required: true })} />
          <input
            name="inputMaxLength"
            placeholder="max 8"
            ref={ref => register({ ref, required: true, maxLength: 8 })}
          />
          <input type="number" name="number" placeholder="max 250 min 20" ref={ref => register({ ref, required: true, max: 250, min: 20 })} />

          <select name="select" ref={ref => register({ ref, required: true })}>
            <option value="">null</option>
            <option value="1">1</option>
            <option value="2">2</option>
          </select>

          <select name="selectMultiple" multiple ref={ref => register({ ref, required: true })}>
            <option value="">null</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>

          <label>
            This is 1: <input type="radio" name="radio" value={1} ref={ref => register({ ref, required: true })} />
          </label>
          <label>
            This is 2: <input type="radio" name="radio" value={2} ref={ref => register({ ref, required: true })} />
          </label>

          <input type="submit" value="Submit" />
        </form>

        <code>
          <h2>Error</h2>
          <pre
            style={{
              width: 0,
            }}
          >
            {Object.keys(errors).length ? JSON.stringify(errors, null, 4) : ''}
          </pre>
        </code>

        <code>
          <h2>Select</h2>
          <pre
            style={{
              width: 0,
            }}
          >
            {JSON.stringify(watch(), null, 4)}
          </pre>
        </code>

        {/*<code>*/}
          {/*<h2>Submit data</h2>*/}
          {/*<pre*/}
            {/*style={{*/}
              {/*width: 0,*/}
            {/*}}*/}
          {/*>*/}
            {/*{Object.keys(submitData).length ? JSON.stringify(submitData, null, 4) : ''}*/}
          {/*</pre>*/}
        {/*</code>*/}
      </div>
    </div>
  );
}

export default App;
