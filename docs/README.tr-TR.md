<div align="center">
    <p align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation">
            <img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/logo.png" alt="React Hook Form Logo - React hook custom hook for form validation" width="300px" />
        </a>
    </p>
</div>

<p align="center">Güçlü, esnek ve genişletilebilir, kolay doğrulama özelliğine sahip formlar.</p>

<div align="center">

[![npm downloads](https://img.shields.io/npm/dm/react-hook-form.svg?style=for-the-badge)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/dt/react-hook-form.svg?style=for-the-badge)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/bundlephobia/minzip/react-hook-form?style=for-the-badge)](https://bundlephobia.com/result?p=react-hook-form)
[![Coverage Status](https://img.shields.io/coveralls/github/bluebill1049/react-hook-form/master?style=for-the-badge)](https://coveralls.io/github/bluebill1049/react-hook-form?branch=master)

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=React+hooks+for+form+validation+without+the+hassle&url=https://github.com/bluebill1049/react-hook-form)&nbsp;[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/react-hook-form)

</div>

<div align="center">
    <p align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation">
            <img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/example.gif" alt="React Hook Form video - React custom hook for form validation" width="100%" />
        </a>
    </p>
</div>

<a href="https://github.com/react-hook-form/react-hook-form">🇦🇺English</a> | <a href="./docs/README.zh-CN.md">🇨🇳 简体中文</a> | <a href="./docs/README.ja-JP.md">🇯🇵 日本語</a> | <a href="./docs/README.ko-KR.md">🇰🇷한국어</a> | <a href="./docs/README.fr-FR.md">🇫🇷Français</a> | <a href="./docs/README.it-IT.md">🇮🇹Italiano</a> | <a href="./docs/README.pt-BR.md">🇧🇷Português</a> | <a href="./docs/README.es-ES.md">🇪🇸Español</a> | <a href="./docs/README.ru-RU.md">🇷🇺Русский</a> | <a href="./docs/README.de-DE.md">🇩🇪Deutsch</a> | 🇹🇷Türkçe

## Features

- Performans ve geliştirici deneyimi gözetilerek yazılmıştır
- Kontrolsüz form doğrulamasını kabul eder
- [Arayüz Kütüphaneleri](https://codesandbox.io/s/react-hook-form-controller-079xx) ile kolay entegrasyon
- Herhangi bir bağımlılık olmadan [ufak boyut](https://bundlephobia.com/result?p=react-hook-form@latest)
- [Validasyon](https://react-hook-form.com/get-started#Applyvalidation) için HTML standartlarını takip eder
- React Native ile uyumludur
- [Yup](https://github.com/jquense/yup), [Joi](https://github.com/hapijs/joi), [Superstruct](https://github.com/ianstormtaylor/superstruct) ya da kişisel validasyonlarınızı destekler
- [Form Oluşturucu](https://react-hook-form.com/form-builder) ile formları hızlıca oluşturabilirsiniz

## Yükleme

    npm install react-hook-form

## Linkler

- [Motivasyon](https://medium.com/@bruce1049/form-validation-with-hook-in-3kb-c5414edf7d64)
- [Video eğitimi](https://www.youtube.com/watch?v=-mFXqOaqgZk&t)
- [Başlangıç](https://react-hook-form.com/get-started)
- [API](https://react-hook-form.com/api)
- [Örnekler](https://github.com/bluebill1049/react-hook-form/tree/master/examples)
- [Demo](https://react-hook-form.com)
- [Form Oluşturucu](https://react-hook-form.com/form-builder)
- [Sıkça Sorulan Sorular](https://react-hook-form.com/faqs)

## Hızlı Başlangıç

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

## Sponsorlar

Logonuzu burada görmek istiyor musunuz? [Twitter'dan mesaj atın](https://twitter.com/HookForm)

## Destekleyenler

Tüm destekçilerimize teşekkür ediyoruz! [[Destekçi ol](https://opencollective.com/react-hook-form#backer)].

<a href="https://opencollective.com/react-hook-form#backers">
    <img src="https://opencollective.com/react-hook-form/backers.svg?width=950" />
</a>

## Organizasyonlar

Bu harika organizasyonlar için çok teşekkürler! [[Katkıda bulunun](https://opencollective.com/react-hook-form/contribute)].

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/organizations.svg?width=950" />
</a>

## Katkıda bulunanlar

Bu harika insanlara çok teşekkürler! [[Katkıda bulunun](CONTRIBUTING.md)].

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/contributors.svg?width=950" />
</a>
