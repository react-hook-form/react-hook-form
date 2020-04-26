<div align="center">
    <p align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Validación simple de formularios React">
            <img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/logo.png" alt="React Hook Form Logo - React hook personalizado para la validación de formularios" width="300px" />
        </a>
    </p>
</div>

<p align="center">Formas performantes, flexibles y extensibles con validación fácil de usar.</p>

<div align="center">

[![CircleCI](https://badgen.net/circleci/github/react-hook-form/react-hook-form)](https://circleci.com/gh/react-hook-form/react-hook-form)
[![npm downloads](https://img.shields.io/npm/dm/react-hook-form.svg?style=for-the-badge)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/dt/react-hook-form.svg?style=for-the-badge)](https://www.npmjs.com/package/react-hook-form)

[![npm](https://img.shields.io/bundlephobia/minzip/react-hook-form?style=for-the-badge)](https://img.shields.io/bundlephobia/minzip/react-hook-form?style=for-the-badge)
[![Coverage Status](https://img.shields.io/coveralls/github/bluebill1049/react-hook-form/master?style=for-the-badge)](https://coveralls.io/github/bluebill1049/react-hook-form?branch=master)

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=React+hooks+for+form+validation+without+the+hassle&url=https://github.com/bluebill1049/react-hook-form)&nbsp;[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/react-hook-form)

</div>

<div align="center">
    <p align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Validación de formularios de reacción simple">
            <img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/example.gif" alt="React Hook Form video - React hook personalizado para la validacion de de formularios" width="100%" />
        </a>
    </p>
</div>

<a href="https://github.com/react-hook-form/react-hook-form">🇦🇺English</a> | <a href="./README.zh-CN.md">🇨🇳 简体中文</a> | <a href="./README.ja-JP.md">🇯🇵 日本語</a> | <a href="./README.ko-KR.md">🇰🇷한국어</a> | <a href="./README.fr-FR.md">🇫🇷Français</a> | <a href="./README.it-IT.md">🇮🇹Italiano</a> | <a href="./README.pt-BR.md">🇧🇷Português</a> | 🇪🇸Español | <a href="./docs/README.ru-RU.md">🇷🇺Русский</a>

## Caracteristicas

- Construido con rendimiento y DX en mente
- Adopte la validación de forma no controlada
- Mejora el rendimiento de formularios controlados
- [Tiny size](https://bundlephobia.com/result?p=react-hook-form@latest) sin ninguna dependencia
- Sigue el estándar HTML para la validación
- Compatible con React Native
- Supports [Yup](https://github.com/jquense/yup) validación basada en esquemas
- Admite la validación del navegador nativo
- Cree formularios rápidamente con el [form builder](https://react-hook-form.com/form-builder)

## Instalación

    $ npm install react-hook-form

## Enlaces

- [Motivación](https://medium.com/@bruce1049/form-validation-with-hook-in-3kb-c5414edf7d64)
- [Video tutorial](https://www.youtube.com/watch?v=-mFXqOaqgZk&t)
- [Empezar](https://react-hook-form.com/get-started)
- [API](https://react-hook-form.com/api)
- [Ejemplos](https://github.com/bluebill1049/react-hook-form/tree/master/examples)
- [Demo](https://react-hook-form.com)
- [Generador de formularios](https://react-hook-form.com/form-builder)
- [FAQs](https://react-hook-form.com/faqs)

## Inicio rápido

```jsx
import React from 'react';
import { useForm } from 'react-hook-form';

function App() {
  const { register, handleSubmit, errors } = useForm(); // inicializar el hook
  const onSubmit = data => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input name="firstname" ref={register} /> {/* registrar una entrada */}

      <input name="lastname" ref={register({ required: true })} />
      {errors.lastname && 'Last name is required.'}

      <input name="age" ref={register({ pattern: /\d+/ })} />
      {errors.age && 'Please enter number for age.'}

      <input type="submit" />
    </form>
  );
}
```

## Patrocinadores

¡Gracias a todos nuestros patrocinadores! [[Hazte patrocinador](https://opencollective.com/react-hook-form#backer)].

<a href="https://opencollective.com/react-hook-form#backers">
    <img src="https://opencollective.com/react-hook-form/backers.svg?width=950" />
</a>

## Organizaciones

Gracias a estas maravillosas organizaciones! [[Contribuir](https://opencollective.com/react-hook-form/contribute)]

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/organizations.svg?width=950" />
</a>

## Colaboradores

Gracias a estas personas maravillosas! [[Hazte colaborador](CONTRIBUTING.md)].

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/contributors.svg?width=950" />
</a>
