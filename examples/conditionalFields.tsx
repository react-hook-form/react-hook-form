import React from "react";
import ReactDOM from "react-dom";
import useForm from "react-hook-form";

function App() {
  const { register, watch, handleSubmit } = useForm();
  const onSubmit = data => {
    console.log(data);
  };

  const moreDetail = watch("moreDetail");

  return (
    <div className="App">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="firstName">First Name</label>
          <input name="firstName" placeholder="Jane" ref={register} />
        </div>

        <div>
          <label htmlFor="lastName">Last Name</label>
          <input name="lastName" placeholder="Doe" ref={register} />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            name="email"
            placeholder="jane@acme.com"
            type="email"
            ref={register}
          />
        </div>

        <div>
          <label htmlFor="lastName">More Details</label>
          <input name="moreDetail" type="checkbox" ref={register} />
        </div>

        <div>
          {moreDetail && <input type="text" name="Interests" ref={register} />}
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
