<div align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation">
            <img src="https://react-hook-form.com/images/react-hook-form-og.png" alt="React Hook Form Logo - React hook custom hook for form validation" />
        </a>
</div>

<div align="center">

[![npm downloads](https://img.shields.io/npm/dm/react-hook-form.svg?style=for-the-badge)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/dt/react-hook-form.svg?style=for-the-badge)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/l/react-hook-form?style=for-the-badge)](https://github.com/react-hook-form/react-hook-form/blob/master/LICENSE)
[![Discord](https://img.shields.io/discord/754891658327359538.svg?style=for-the-badge&label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/yYv7GZ8)

</div>

<p align="center">
  <a href="https://react-hook-form.com/get-started">Get started</a> | 
  <a href="https://react-hook-form.com/docs">API</a> |
  <a href="https://react-hook-form.com/form-builder">Form Builder</a> |
  <a href="https://react-hook-form.com/faqs">FAQs</a> |
  <a href="https://github.com/react-hook-form/react-hook-form/tree/master/examples">Examples</a>
</p>

### Features

- Built with performance, UX and DX in mind
- Embraces native HTML form [validation](https://react-hook-form.com/get-started#Applyvalidation)
- Out of the box integration with [UI libraries](https://codesandbox.io/s/react-hook-form-v7-controller-5h1q5)
- [Small size](https://bundlephobia.com/result?p=react-hook-form@latest) and no [dependencies](./package.json)
- Supports [Yup](https://github.com/jquense/yup), [Zod](https://github.com/colinhacks/zod), [AJV](https://github.com/ajv-validator/ajv), [Superstruct](https://github.com/ianstormtaylor/superstruct), [Joi](https://github.com/hapijs/joi) and [others](https://github.com/react-hook-form/resolvers)

### Install

    npm install react-hook-form

### Quickstart

```jsx
import { useForm } from 'react-hook-form';

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register('firstName')} />
      <input {...register('lastName', { required: true })} />
      {errors.lastName && <p>Last name is required.</p>}
      <input {...register('age', { pattern: /\d+/ })} />
      {errors.age && <p>Please enter a number for age.</p>}
      <input type="submit" />
    </form>
  );
}
```

### Sponsors

We’re incredibly grateful to these kind and generous sponsors for their support!

## Major Sponsors

| Follower24 |
|---|
| <a href="https://www.follower24.de/"><img src="https://images.opencollective.com/follower24/00297f8/avatar/256.png?height=256" width="120"/></a> |

## Supporting Sponsors

| Pennylane | Thanks.dev | Kinsta | Niche | Principal | Hygraph |
|---|---|---|---|---|---|
| <a href="https://github.com/pennylane-hq"><img src="https://github.com/pennylane-hq.png" width="60"/></a> | <a href="https://thanks.dev/"><img src="https://avatars.githubusercontent.com/u/72539280?s=200&v=4" width="60"/></a> | <a href="https://kinsta.com/"><img src="https://images.opencollective.com/kinsta/55912d7/logo/256.png?height=256" width="60"/></a> | <a href="https://niche.com"><img src="https://avatars.githubusercontent.com/u/8988784?s=200&v=4" width="60"/></a> | <a href="https://principal.com/about-us"><img src="https://images.opencollective.com/principal/431e690/logo/256.png?height=256" width="60"/></a> | <a href="https://hygraph.com"><img src="https://avatars.githubusercontent.com/u/31031438" width="60"/></a> |

### Past Sponsors

Thank you to our previous sponsors for your generous support!

| [Route4Me](https://route4me.com/) | [SGKB](https://www.sgkb.ch/) | [Sanity](https://www.sanity.io/) | [Twicsy](https://twicsy.com/) | [Leniolabs](https://www.leniolabs.com/) | [Underbelly](https://underbelly.is) |
|---|---|---|---|---|---|
| [Feathery](https://feathery.io) | [Getform](https://getform.io) | [Marmelab](https://marmelab.com/) | [Formcarry](https://formcarry.com/) | [Fabform](https://fabform.io) | [Thinkmill](https://www.thinkmill.com.au/) |
| [Kwork](https://kwork.studio/) | [Fiberplane](https://fiberplane.com/) | [JetBrains](https://www.jetbrains.com/) | [Mirakl](https://www.mirakl.com/) | [Wantedly](https://wantedlyinc.com) | [CasinoReviews](https://www.casinoreviews.net/) |
| [Kaname](https://kanamekey.com) | [BuyFans](https://buy.fans/) | [Toss](https://toss.im) | [Workleap](https://workleap.com/) | [Sent.dm](https://www.sent.dm) | |

### Backers

Thanks go to all our backers! [[Become a backer](https://opencollective.com/react-hook-form#backer)].

<a href="https://opencollective.com/react-hook-form#backers">
    <img src="https://opencollective.com/react-hook-form/backers.svg?width=820" />
</a>

### Contributors

Thanks go to these wonderful people! [[Become a contributor](CONTRIBUTING.md)].

<br />
<br />

<p align="center">Documentation website supported and backed by <a href="https://vercel.com"><b>Vercel</b></a></p>