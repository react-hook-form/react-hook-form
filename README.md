# 📋 React forme  🚧 (under development)

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=React+Forme&url=https://github.com/bluebill1049/react-forme)&nbsp;[![CircleCI](https://circleci.com/gh/bluebill1049/react-forme.svg?style=svg)](https://circleci.com/gh/bluebill1049/react-forme) [![Coverage Status](https://coveralls.io/repos/github/bluebill1049/react-forme/badge.svg?branch=master)](https://coveralls.io/github/bluebill1049/react-forme?branch=master) [![npm downloads](https://img.shields.io/npm/dm/react-forme.svg?style=flat-square)](https://www.npmjs.com/package/react-forme)
[![npm](https://img.shields.io/npm/dt/react-forme.svg?style=flat-square)](https://www.npmjs.com/package/react-forme)
[![npm](https://img.shields.io/npm/l/react-forme.svg?style=flat-square)](https://www.npmjs.com/package/react-lazyload-image)

## Install

    $ npm install react-forme

## Quickstart

```jsx
import useForm from 'react-forme';

function App() {
    const { register, handleSubmit } = useForm();
    const onSubmit = (data) => { console.log(data); }
    
    return <form onSubmit={handleSubmit(onSubmit}>
        <input name="firstname" ref={(ref) => register({ ref, required: true })} />
        <input name="lastname" ref={(ref) => register({ ref, pattern: "[a-z]{1,15}" })} />
        <input type="submit" />
    </form>
}

```
