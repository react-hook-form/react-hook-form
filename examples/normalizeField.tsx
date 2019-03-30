import React from "react";
import ReactDOM from "react-dom";
import useForm from "react-hook-form";

function App() {
  const { register, handleSubmit } = useForm();
  const onSubmit = data => {
    alert(JSON.stringify(data));
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="firstName">First Name</label>
          <input
            name="firstName"
            onChange={e => {
              if (e.target.value) {
                e.target.value = e.target.value.toUpperCase();
              }
            }}
            placeholder="bill"
            ref={register}
          />
        </div>

        <div>
          <label htmlFor="lastName">Last Name</label>
          <input
            name="lastName"
            onChange={e => {
              if (e.target.value) {
                e.target.value = e.target.value.toLowerCase();
              }
            }}
            placeholder="luo"
            ref={register}
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            name="email"
            placeholder="bluebill1049@hotmail.com"
            type="email"
            ref={register}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
