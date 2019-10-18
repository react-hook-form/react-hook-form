<div align="center">
    <p align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation">
            <img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/logo.png" alt="React Hook Form Logo - React hook custom hook for form validation" width="300px" />
        </a>
    </p>
</div>

<p align="center">Formulaires performants, flexibles et extensibles dotés d'une validation poussée et facile à utiliser.</p>


<div align="center">

[![CircleCI](https://badgen.net/circleci/github/react-hook-form/react-hook-form)](https://circleci.com/gh/react-hook-form/react-hook-form)
[![npm downloads](https://img.shields.io/npm/dm/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/dt/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-hook-form)
![dep](https://badgen.net/david/dep/bluebill1049/react-hook-form)
[![npm](https://badgen.net/bundlephobia/minzip/react-hook-form)](https://badgen.net/bundlephobia/minzip/react-hook-form)
[![Coverage Status](https://coveralls.io/repos/github/bluebill1049/react-hook-form/badge.svg?branch=master)](https://coveralls.io/github/bluebill1049/react-hook-form?branch=master)

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=React+hooks+for+form+validation+without+the+hassle&url=https://github.com/bluebill1049/react-hook-form)&nbsp;[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/react-hook-form)

</div>

<div align="center">
    <p align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation">
            <img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/example.gif" alt="React Hook Form video - React custom hook for form validation" width="750px" />
        </a>
    </p>
</div>

🇦🇺English | <a href="./README.zh-CN.md">🇨🇳简体中文</a> | <a href="./README.ja-JP.md">🇯🇵日本语</a> | <a href="./README.fr-FR.md">🇫🇷 Français</a>

## Fonctionnalités

- Développé en privilegiant les performances et l'experience developpeur.
- Formulaires non-contrôlés.
- [Taille reduite](https://bundlephobia.com/result?p=react-hook-form@latest) sans aucune dépendance.
- Respecte les normes de validation HTML.
- Compatible avec React Native.
- Supporte [Yup](https://github.com/jquense/yup) pour de la validation via schéma.
- Supporte la validation native du navigateur.
- Possibilité de développer des formulaires rapidement grâce au [form builder](https://react-hook-form.com/form-builder).

## Installation

    $ npm install react-hook-form

## Liens

- [Motivation](https://medium.com/@bruce1049/form-validation-with-hook-in-3kb-c5414edf7d64)
- [Tutoriel vidéo](https://www.youtube.com/watch?v=-mFXqOaqgZk&t)
- [Bien demarrer](https://react-hook-form.com/get-started)
- [API](https://react-hook-form.com/api)
- [Exemples](https://github.com/bluebill1049/react-hook-form/tree/master/examples)
- [Démo](https://react-hook-form.com)
- [Form Builder](https://react-hook-form.com/form-builder)
- [FAQs](https://react-hook-form.com/faq)

## Démarrage rapide

```jsx
import React from 'react';
import useForm from 'react-hook-form';

function App() {
  const { register, handleSubmit, errors } = useForm(); // initialise the hook
  const onSubmit = data => {
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

## Contributeurs

Thanks goes to these wonderful people. [[Become a contributor](CONTRIBUTING.md)].

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/contributors.svg?width=950" />
</a>

## Sponsors

Merci à tous nos sponsors ! [[Become a backer](https://opencollective.com/react-hook-form#backer)].

<a href="https://opencollective.com/react-hook-form#backers">
    <img src="https://opencollective.com/react-hook-form/backers.svg?width=950" />
</a>
