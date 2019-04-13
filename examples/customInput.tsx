import React from 'react';
import ReactDOM from 'react-dom';
import useForm from 'react-hook-form';
import Input from '@material-ui/core/Input'; // you will need to install masterial ui

const MyInput = ({ name, label, register }) => {
  return (
    <>
      <label htmlFor={name}>{label}</label>
      <input name={name} placeholder="Jane" ref={register} />
    </>
  );
};

function App() {
  const { register, handleSubmit } = useForm();
  const onSubmit = data => {
    alert(JSON.stringify(data, null));
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Input
            name="HelloWorld"
            inputRef={register}
            defaultValue="Hello world"
            inputProps={{
              'aria-label': 'Description',
            }}
          />
        </div>

        <div>
          <MyInput name="firstName" label="First Name" register={register} />
        </div>

        <div>
          <label htmlFor="lastName">Last Name</label>
          <input name="lastName" placeholder="Luo" ref={register} />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input name="email" placeholder="bluebill1049@hotmail.com" type="email" ref={register} />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
