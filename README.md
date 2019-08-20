<div align="right">🇦🇺English | <a href="https://github.com/bluebill1049/react-hook-form/blob/master/README.zh-CN.md">🇨🇳简体中文</a></div>

<div align="center"><p align="center"><a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation"><img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/logo.png" alt="React Hook Form Logo - React hook form validation" width="330px" /></a></p></div>

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=React+Hook-Form&url=https://github.com/bluebill1049/react-hook-form)&nbsp;
[![CircleCI](https://circleci.com/gh/react-hook-form/react-hook-form.svg?style=svg)](https://circleci.com/gh/react-hook-form/react-hook-form)
[![Coverage Status](https://coveralls.io/repos/github/bluebill1049/react-hook-form/badge.svg?branch=master)](https://coveralls.io/github/bluebill1049/react-hook-form?branch=master)
[![npm downloads](https://img.shields.io/npm/dm/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/dt/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://badgen.net/bundlephobia/minzip/react-hook-form)](https://badgen.net/bundlephobia/minzip/react-hook-form)
[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/react-hook-form)

- Super easy to integrate and create forms
- Built with performance and DX in mind
- Uncontrolled form validation
- [Tiny size](https://bundlephobia.com/result?p=react-hook-form@latest) without any dependency
- Follows HTML standard for validation
- Support browser native validation
- Build forms quickly with the [form builder](https://react-hook-form.com/builder)

<br />
<div align="center"><p align="center"><a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation"><img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/example.gif" alt="React Hook Form Logo - React hook form validation" width="750px" /></a></p></div>

## Install

    $ npm install react-hook-form

## [Docs](https://react-hook-form.com/api)

- [Motivation](https://medium.com/@bruce1049/form-validation-with-hook-in-3kb-c5414edf7d64)
- [Get started](https://react-hook-form.com/get-started)
- [API](https://react-hook-form.com/api)
- [Examples](https://github.com/bluebill1049/react-hook-form/tree/master/examples)
- [Demo](https://react-hook-form.com)
- [Form Builder](https://react-hook-form.com/builder)
- [FAQs](https://react-hook-form.com/faq)

## Quickstart

```jsx
import React from 'react';
import useForm from 'react-hook-form';

function App() {
  const { register, handleSubmit, errors } = useForm(); // initialise the hook
  const onSubmit = data => {
    console.log(data);
  }; // callback when validation pass

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input name="firstname" ref={register} /> {/* register an input */}
      
      <input name="lastname" ref={register({ required: true })} />
      {errors.lastname && 'Last name is required.'}
      
      <input name="age" ref={register({ pattern: /\d+/ })} />
      {errors.age && 'Please enter number for age.'}
      
      <input type="submit" />
    </form>
  );
}
```

## Contributors

Thanks goes to these wonderful people:

<p float="left">
    <a href="https://github.com/barrymay"><img src="https://avatars2.githubusercontent.com/u/5514034?s=400&v=4" width="50" height="50" /></a>
    <a href="https://github.com/stramel"><img src="https://avatars1.githubusercontent.com/u/855184?s=460&v=4" width="50" height="50" /></a>
    <a href="https://github.com/AyumiKai"><img src="https://avatars3.githubusercontent.com/u/14857042?s=60&v=4" width="50" height="50" /></a>
    <a href="https://github.com/mat-jaworski"><img src="https://avatars0.githubusercontent.com/u/11812094?s=460&v=4" width="50" height="50" /></a>
    <a href="https://github.com/cfgj"><img src="https://avatars0.githubusercontent.com/u/802795?s=460&v=4" width="50" height="50" /></a>
    <a href="https://github.com/abihf"><img src="https://avatars1.githubusercontent.com/u/1484485?s=180&v=4" width="50" height="50" /></a>
    <a href="https://github.com/Nickman87"><img src="https://avatars2.githubusercontent.com/u/870416?s=460&v=4" width="50" height="50" /></a>
    <a href="https://github.com/ell10t"><img src="https://avatars2.githubusercontent.com/u/35668113?s=460&v=4" width="50" height="50" />
    <a href="https://github.com/chrisparton1991"><img src="https://avatars0.githubusercontent.com/u/13063119?s=460&v=4" width="50" height="50" />
    <a href="https://github.com/tizz98"><img src="https://avatars1.githubusercontent.com/u/5739698?s=460&v=4" width="50" height="50" />
    <a href="https://github.com/lightsound"><img src="https://avatars2.githubusercontent.com/u/8220973?s=460&v=4" width="50" height="50" /></a>
    <a href="https://github.com/jasondibenedetto"><img src="https://avatars0.githubusercontent.com/u/1239739?s=460&v=4" width="50" height="50" /></a>
    <a href="https://github.com/kabriel"><img src="https://avatars3.githubusercontent.com/u/153115?s=180&v=4" width="50" height="50" /></a> 
    <a href="https://github.com/kaleabmelkie"><img src="https://avatars2.githubusercontent.com/u/29814842?s=460&v=4" width="50" height="50" /></a>    
    <a href="https://github.com/bmamouri"><img src="https://avatars0.githubusercontent.com/u/6419173?s=460&v=4" width="50" height="50" /></a>   
    <a href="https://github.com/ejuo"><img src="https://avatars2.githubusercontent.com/u/1243837?s=460&v=4" width="50" height="50" /></a>    
    <a href="https://github.com/liketurbo"><img src="https://avatars3.githubusercontent.com/u/29164042?s=460&v=4" width="50" height="50" /></a>
    <a href="https://github.com/michaelbirchler"><img src="https://avatars3.githubusercontent.com/u/24622?s=460&v=4" width="50" height="50" /></a>
    <a href="https://github.com/petercpwong"><img src="https://avatars1.githubusercontent.com/u/1303285?s=460&v=4" width="50" height="50" /></a>
    <a href="https://github.com/garthmcrae"><img src="https://avatars0.githubusercontent.com/u/1332741?s=64&v=4" width="50" height="50" /></a>
    <a href="https://github.com/erikras"><img src="https://avatars3.githubusercontent.com/u/4396759?s=60&v=4" width="50" height="50" /></a>
</p>
