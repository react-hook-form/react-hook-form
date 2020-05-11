<div align="center">
    <p align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Einfache React Formular Eingabeprüfung">
            <img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/logo.png" alt="React Hook Form Logo - React einstellbare Hook für Formulareingabeprüfung" width="300px" />
        </a>
    </p>
</div>

<p align="center">Schnellladende, flexible und erweiterbare Formulare mit benutzerfreundlicher Eingabeprüfung</p>

<div align="center">

[![npm downloads](https://img.shields.io/npm/dm/react-hook-form.svg?style=for-the-badge)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/dt/react-hook-form.svg?style=for-the-badge)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/bundlephobia/minzip/react-hook-form?style=for-the-badge)](https://bundlephobia.com/result?p=react-hook-form)
[![Coverage Status](https://img.shields.io/coveralls/github/bluebill1049/react-hook-form/master?style=for-the-badge)](https://coveralls.io/github/bluebill1049/react-hook-form?branch=master)

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=React+hooks+for+form+validation+without+the+hassle&url=https://github.com/bluebill1049/react-hook-form)&nbsp;[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/react-hook-form)

</div>

<div align="center">
    <p align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Einfache React Formular Eingabeprüfung">
            <img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/example.gif" alt="React Hook Form video - React einstellbare Hook für Formulareingabeprüfung" width="100%" />
        </a>
    </p>
</div>

<a href="https://github.com/react-hook-form/react-hook-form">🇦🇺English</a> | <a href="./docs/README.zh-CN.md">🇨🇳 简体中文</a> | <a href="./docs/README.ja-JP.md">🇯🇵 日本語</a> | <a href="./docs/README.ko-KR.md">🇰🇷한국어</a> | <a href="./docs/README.fr-FR.md">🇫🇷Français</a> | <a href="./docs/README.it-IT.md">🇮🇹Italiano</a> | <a href="./docs/README.pt-BR.md">🇧🇷Português</a> | <a href="./docs/README.es-ES.md">🇪🇸Español</a> | <a href="./docs/README.ru-RU.md">🇷🇺Русский</a> | 🇩🇪Deutsch | <a href="./docs/README.tr-TR.md">🇹🇷Türkçe</a>

## Eigenschaften

- Mit Hinblick auf Leistung und Entwicklererfahrung geschrieben
- Akzeptiert unkontrollierter Eingabeprüfung
- Einfache integration mit [Benutzeroberflaechen Bibliotheken](https://codesandbox.io/s/react-hook-form-controller-079xx)
- [Wenig Speicherbedarf](https://bundlephobia.com/result?p=react-hook-form@latest) ohne Abhnägigkeiten
- Entspricht HTML Standart für [Eingabeprüfung](https://react-hook-form.com/get-started#Applyvalidation)
- Kompatibel mit React Native
- Unterstützt [Yup](https://github.com/jquense/yup), [Joi](https://github.com/hapijs/joi), [Superstruct](https://github.com/ianstormtaylor/superstruct) or frei programierbar
- Erstelle Formulare schnell mit dem [Formular Erseller](https://react-hook-form.com/form-builder)

## Installation

    npm install react-hook-form

## Weitere Information

- [Motivation](https://medium.com/@bruce1049/form-validation-with-hook-in-3kb-c5414edf7d64)
- [Video Lehrgang](https://www.youtube.com/watch?v=-mFXqOaqgZk&t)
- [Anfangen](https://react-hook-form.com/get-started)
- [API](https://react-hook-form.com/api)
- [Beispiele](https://github.com/bluebill1049/react-hook-form/tree/master/examples)
- [Demonstration](https://react-hook-form.com)
- [Formular Ersteller](https://react-hook-form.com/form-builder)
- [Häufige Fragen](https://react-hook-form.com/faqs)

## Schneller Einstieg

```jsx
import React from 'react';
import { useForm } from 'react-hook-form';

function App() {
  const { register, handleSubmit, errors } = useForm(); // initialise the hook
  const onSubmit = (data) => {
    console.log(data);
  };

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

## Sponsoren

Möchten sie Ihr Logo hier? [Direktnachricht mit Twitter](https://twitter.com/HookForm)

## Unterstützer

Vielen Dank an alle unsere Unterstützer! [[Werde auch ein Unterstützer](https://opencollective.com/react-hook-form#backer)].

<a href="https://opencollective.com/react-hook-form#backers">
    <img src="https://opencollective.com/react-hook-form/backers.svg?width=950" />
</a>

## Organisationen

Unser Dank geht auch an folgende wundervolle Organisationen! [[Spenden](https://opencollective.com/react-hook-form/contribute)].

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/organizations.svg?width=950" />
</a>

## Kontributoren

Unser Dank geht auch an folgende wundervolle Personen! [[Werde auch ein Kontributor](CONTRIBUTING.md)].

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/contributors.svg?width=950" />
</a>
