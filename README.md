# 📋 React forme  🚧 (under development)

## Install

    $ npm install react-forme

## Example

## Quickstart

```jsx
import useForm from 'react-forme';

function App() {
    const { register, prepareSubmit } = useForm();
    const onSubmit = (data) => { console.log(data); }
    
    return <form onSubmit={prepareSubmit(onSubmit}>
        <input name="firstname" ref={(ref) => register({ ref })} />
        <input name="lastname" ref={(ref) => register({ ref })} />
        <input type="submit" />
    </form>
}

```

## Props

| Prop               | Type                                             | Required | Description                                  |
