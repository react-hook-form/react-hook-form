<div align="center"><a href="https://react-hook-form.now.sh/"><img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/logo.png" alt="React forme Logo - React hook form valiation" width="350px" /></a></div>

> React hook form validation without the hassle 

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=React+Hook-Form&url=https://github.com/bluebill1049/react-hook-form)&nbsp;[![CircleCI](https://circleci.com/gh/bluebill1049/react-hook-form.svg?style=svg)](https://circleci.com/gh/bluebill1049/react-hook-form) [![Coverage Status](https://coveralls.io/repos/github/bluebill1049/react-hook-form/badge.svg?branch=master)](https://coveralls.io/github/bluebill1049/react-hook-form?branch=master) [![npm downloads](https://img.shields.io/npm/dm/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/dt/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/l/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-lazyload-image)
[![Donate](https://img.shields.io/badge/donate-paypal-orange.svg?style=flat-square)](https://www.paypal.com/donate/?token=_m4SCZMEfepZQZn6nTYqdf7_8aheqLH1Rpy8oteP8nUlD0Ubp1nm4hGcPos5KACFr4AW7m&country.x=AU&locale.x=AU)

- Super easy to create forms and integrate
- Build with React hook, performance and developer experience in mind
- Follow html standard for validation
- Tiny size without other dependency 2 kB (minified + gzipped)
- Build a quick form with [form builder](https://react-hook-form.now.sh/builder)

## Install

    $ npm install react-hook-form

## [Website](https://react-hook-form.now.sh/api)

- [Get started](https://react-hook-form.now.sh/api)
- [API](https://react-hook-form.now.sh/api)
- [Demo](https://react-hook-form.now.sh)
- [Form Builder](https://react-hook-form.now.sh/builder)

## Quickstart

```jsx
import React from 'react'
import useForm from 'react-hook-form'

function App() {
  const { register, handleSubmit, errors } = useForm()
  const onSubmit = (data) => { console.log(data) }
  console.log(errors)
    
  return (
    <form onSubmit={handleSubmit(onSubmit}>
      <input name="firstname" ref={(ref) => register({ ref, required: true })} />
      <input name="lastname" ref={(ref) => register({ ref, pattern: "[a-z]{1,15}" })} />
      <input type="submit" />
    </form>
  )
}

```
