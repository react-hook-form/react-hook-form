<div align="right">English | <a href="https://github.com/bluebill1049/react-hook-form/blob/master/docs/README.zh-CN.md">简体中文</a></div>

<div align="center"><a href="https://react-hook-form.now.sh/"><img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/logo.png" alt="React forme Logo - React hook form valiation" width="350px" /></a></div>

> React hook form validation without the hassle 

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=React+Hook-Form&url=https://github.com/bluebill1049/react-hook-form)&nbsp;[![CircleCI](https://circleci.com/gh/bluebill1049/react-hook-form.svg?style=svg)](https://circleci.com/gh/bluebill1049/react-hook-form) [![Coverage Status](https://coveralls.io/repos/github/bluebill1049/react-hook-form/badge.svg?branch=master)](https://coveralls.io/github/bluebill1049/react-hook-form?branch=master) [![npm downloads](https://img.shields.io/npm/dm/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/dt/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/l/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-lazyload-image)

- Super easy to create forms and integrate
- Build with React hook, performance and developer experience in mind
- Follow html standard for validation
- Tiny size without other dependency 2 kB (minified + gzipped)
- Build a quick form with [form builder](https://react-hook-form.now.sh/builder)

## Install

    $ npm install react-hook-form

## [Docs](https://react-hook-form.now.sh/api)

- [Get started](https://react-hook-form.now.sh/api)
- [API](https://react-hook-form.now.sh/api)
- [Examples](https://github.com/bluebill1049/react-hook-form/tree/master/examples)
- [Demo](https://react-hook-form.now.sh)
- [Form Builder](https://react-hook-form.now.sh/builder)

## Quickstart

```jsx
import React from 'react'
import useForm from 'react-hook-form'

function App() {
  const { register, handleSubmit, errors } = useForm()
  const onSubmit = (data) => { console.log(data) }
    
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input name="firstname" ref={register} />
      
      <input name="lastname" ref={register({ required: true })} />
      {errors.lastname && 'Last name is required.'}
      
      <input name="age" ref={register({ pattern: /\d+/ })} />
      {errors.age && 'Please enter number for age.'}
      
      <input type="submit" />
    </form>
  )
}
```

## Contributors 
Thanks goes to these wonderful people:

<p float="left">
    <a href="https://github.com/AyumiKai"><img src="https://avatars3.githubusercontent.com/u/14857042?s=60&v=4" width="50" height="50" /></a>
    <a href="https://github.com/garthmcrae"><img src="https://avatars0.githubusercontent.com/u/1332741?s=64&v=4" width="50" height="50" /></a>
    <a href="https://github.com/erikras"><img src="https://avatars3.githubusercontent.com/u/4396759?s=60&v=4" width="50" height="50" /></a>
</p>
