<div align="right">English | <a href="https://github.com/bluebill1049/react-hook-form/blob/master/docs/README.zh-CN.md">简体中文</a></div>

<div align="center"><p align="center"><a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation"><img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/logo.png" alt="React Hook Form Logo - React hook form validation" width="350px" /></a></p></div>

> React hook form validation without the hassle 

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=React+Hook-Form&url=https://github.com/bluebill1049/react-hook-form)&nbsp;
[![CircleCI](https://circleci.com/gh/bluebill1049/react-hook-form.svg?style=svg)](https://circleci.com/gh/bluebill1049/react-hook-form) 
[![Coverage Status](https://coveralls.io/repos/github/bluebill1049/react-hook-form/badge.svg?branch=master)](https://coveralls.io/github/bluebill1049/react-hook-form?branch=master) 
[![npm downloads](https://img.shields.io/npm/dm/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/dt/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://badgen.net/bundlephobia/minzip/react-hook-form)](https://badgen.net/bundlephobia/minzip/react-hook-form)

- Super easy to integrate and create forms
- Built with performance and developer experience in mind
- Follows HTML standard for validation
- Tiny size without any dependency
- uncontrolled form validation
- Build forms quickly with the [form builder](https://react-hook-form.com/builder)

## Install

    $ npm install react-hook-form

## [Docs](https://react-hook-form.com/api)

- [Motivation](https://medium.com/@bruce1049/form-validation-with-hook-in-3kb-c5414edf7d64)
- [Get started](https://react-hook-form.com/api)
- [API](https://react-hook-form.com/api)
- [Examples](https://github.com/bluebill1049/react-hook-form/tree/master/examples)
- [Demo](https://react-hook-form.com)
- [Form Builder](https://react-hook-form.com/builder)
- [FAQs](https://react-hook-form.com/faq)

## Quickstart

```jsx
import React from 'react'
import useForm from 'react-hook-form'

function App() {
  const { register, handleSubmit, errors } = useForm() // initialise the hook
  const onSubmit = (data) => { console.log(data) } // callback when validation pass
    
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input name="firstname" ref={register} /> {/* register an input */}
      
      <input name="lastname" ref={register({ required: true })} /> {/* apply required validation */}
      {errors.lastname && 'Last name is required.'} {/* error message */}
      
      <input name="age" ref={register({ pattern: /\d+/ })} /> {/* apply pattern validation */}
      {errors.age && 'Please enter number for age.'} {/* error message */}
      
      <input type="submit" />
    </form>
  )
}
```

## Contributors 
Thanks goes to these wonderful people:

<p float="left">
    <a href="https://github.com/AyumiKai"><img src="https://avatars3.githubusercontent.com/u/14857042?s=60&v=4" width="50" height="50" /></a>
    <a href="https://github.com/abihf"><img src="https://avatars1.githubusercontent.com/u/1484485?s=180&v=4" width="50" height="50" />
    <a href="https://github.com/garthmcrae"><img src="https://avatars0.githubusercontent.com/u/1332741?s=64&v=4" width="50" height="50" /></a>
    <a href="https://github.com/erikras"><img src="https://avatars3.githubusercontent.com/u/4396759?s=60&v=4" width="50" height="50" /></a>
</p>
