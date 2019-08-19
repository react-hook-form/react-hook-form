<div align="center"><a href="https://react-hook-form.now.sh/"><img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/logo.png" alt="React forme Logo - React hook form valiation" width="350px" /></a></div>

> React hook form 让表单校验不再烦恼

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=React+Hook-Form&url=https://github.com/bluebill1049/react-hook-form)&nbsp;
[![CircleCI](https://circleci.com/gh/bluebill1049/react-hook-form.svg?style=svg)](https://circleci.com/gh/bluebill1049/react-hook-form) 
[![Coverage Status](https://coveralls.io/repos/github/bluebill1049/react-hook-form/badge.svg?branch=master)](https://coveralls.io/github/bluebill1049/react-hook-form?branch=master) 
[![npm downloads](https://img.shields.io/npm/dm/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/dt/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://badgen.net/bundlephobia/minzip/react-hook-form)](https://badgen.net/bundlephobia/minzip/react-hook-form)

- 使创建表单和集成更加便捷
- 以性能和开发体验为基础构建
- 非受控表单校验
- [迷你](https://bundlephobia.com/result?p=react-hook-form@latest)的体积而没有其他依赖
- 遵循html标准进行校验
- 支持浏览器原生校验
- 从[这里](https://react-hook-form.now.sh/builder)快速构建你的表单

<div align="center"><p align="center"><a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation"><img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/example.gif" alt="React Hook Form Logo - React hook form validation" width="750px" /></a></p></div>

## 安装

    $ npm install react-hook-form

## [文档](https://react-hook-form.now.sh/api)
- [动机](https://medium.com/@bruce1049/form-validation-with-hook-in-3kb-c5414edf7d64)
- [开始](https://react-hook-form.com/get-started)
- [API](https://react-hook-form.now.sh/api)
- [示例](https://github.com/bluebill1049/react-hook-form/tree/master/examples)
- [Demo](https://react-hook-form.now.sh)
- [Form Builder](https://react-hook-form.now.sh/builder)
- [常见问题](https://react-hook-form.com/faq)

## 快速开始

```jsx
import React from "react";
import useForm from "react-hook-form";

function App() {
  const { register, handleSubmit, errors } = useForm(); // initialise the hook
  const onSubmit = data => { console.log(data) }; // callback when validation pass

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input name="firstname" ref={register} /> {/* register an input */}
      
      <input
        name="lastname"
        ref={register({ required: true })}
      />
      {errors.lastname && "Last name is required."}
      
      <input
        name="age"
        ref={register({ pattern: /\d+/ })}
      />
      {errors.age && "Please enter number for age."}
      
      <input type="submit" />
    </form>
  );
}
```

## 贡献者 
感谢这些为该开源项目作出贡献的人:

<p float="left">
    <a href="https://github.com/barry4dev"><img src="https://avatars2.githubusercontent.com/u/5514034?s=400&v=4" width="50" height="50" />
    <a href="https://github.com/AyumiKai"><img src="https://avatars3.githubusercontent.com/u/14857042?s=60&v=4" width="50" height="50" /></a>
    <a href="https://github.com/mat-jaworski"><img src="https://avatars0.githubusercontent.com/u/11812094?s=460&v=4" width="50" height="50" /></a>
    <a href="https://github.com/abihf"><img src="https://avatars1.githubusercontent.com/u/1484485?s=180&v=4" width="50" height="50" />
    <a href="https://github.com/ell10t"><img src="https://avatars2.githubusercontent.com/u/35668113?s=460&v=4" width="50" height="50" />
    <a href="https://github.com/lightsound"><img src="https://avatars2.githubusercontent.com/u/8220973?s=460&v=4" width="50" height="50" /></a>
    <a href="https://github.com/jasondibenedetto"><img src="https://avatars0.githubusercontent.com/u/1239739?s=460&v=4" width="50" height="50" /></a>
    <a href="https://github.com/kabriel"><img src="https://avatars3.githubusercontent.com/u/153115?s=180&v=4" width="50" height="50" /></a>    
    <a href="https://github.com/ejuo"><img src="https://avatars2.githubusercontent.com/u/1243837?s=460&v=4" width="50" height="50" /></a>    
    <a href="https://github.com/stramel"><img src="https://avatars1.githubusercontent.com/u/855184?s=460&v=4" width="50" height="50" /></a>
    <a href="https://github.com/liketurbo"><img src="https://avatars3.githubusercontent.com/u/29164042?s=460&v=4" width="50" height="50" /></a>
    <a href="https://github.com/garthmcrae"><img src="https://avatars0.githubusercontent.com/u/1332741?s=64&v=4" width="50" height="50" /></a>
    <a href="https://github.com/erikras"><img src="https://avatars3.githubusercontent.com/u/4396759?s=60&v=4" width="50" height="50" /></a>
</p>
