<div align="center"><a href="https://react-hook-form.now.sh/"><img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/logo.png" alt="React forme Logo - React hook form valiation" width="350px" /></a></div>

> React hook form 让表单校验不再烦恼

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=React+Hook-Form&url=https://github.com/bluebill1049/react-hook-form)&nbsp;[![CircleCI](https://circleci.com/gh/bluebill1049/react-hook-form.svg?style=svg)](https://circleci.com/gh/bluebill1049/react-hook-form) [![Coverage Status](https://coveralls.io/repos/github/bluebill1049/react-hook-form/badge.svg?branch=master)](https://coveralls.io/github/bluebill1049/react-hook-form?branch=master) [![npm downloads](https://img.shields.io/npm/dm/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/dt/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/l/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-lazyload-image)

- 使创建表单和集成更加便捷
- 基于React hook构建，更注重性能和开发体验
- 遵循html标准进行校验
- 迷你的体积而没有其他依赖(经过minified + gzipped优化后包只有2kb大小)
- 从[这里](https://react-hook-form.now.sh/builder)快速构建你的表单

## 安装

    $ npm install react-hook-form

## [文档](https://react-hook-form.now.sh/api)

- [开始](https://react-hook-form.now.sh/api)
- [API](https://react-hook-form.now.sh/api)
- [示例](https://github.com/bluebill1049/react-hook-form/tree/master/examples)
- [Demo](https://react-hook-form.now.sh)
- [Form Builder](https://react-hook-form.now.sh/builder)

## 快速开始

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
