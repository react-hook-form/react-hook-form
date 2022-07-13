<div align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation">
            <img src="https://raw.githubusercontent.com/react-hook-form/react-hook-form/master/docs/logo.png" alt="React Hook Form Logo - React hook custom hook for form validation" />
        </a>
</div>

https://user-images.githubusercontent.com/10513364/152621466-59a41c65-52b4-4518-9d79-ffa3fafa498a.mp4

<div align="center">

[![npm downloads](https://img.shields.io/npm/dm/react-hook-form.svg?style=for-the-badge)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/dt/react-hook-form.svg?style=for-the-badge)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/l/react-hook-form?style=for-the-badge)](https://github.com/react-hook-form/react-hook-form/blob/master/LICENSE)
[![Discord](https://img.shields.io/discord/754891658327359538.svg?style=for-the-badge&label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/yYv7GZ8)

</div>

<p align="center">
  <a href="https://react-hook-form.com/get-started">Get started</a> | 
  <a href="https://react-hook-form.com/api">API</a> |
  <a href="https://github.com/bluebill1049/react-hook-form/tree/master/examples">Examples</a> |
  <a href="https://react-hook-form.com">Demo</a> |
  <a href="https://react-hook-form.com/form-builder">Form Builder</a> |
  <a href="https://react-hook-form.com/faqs">FAQs</a>
</p>

### Features

- Built with performance, UX and DX in mind
- Embraces native HTML form [validation](https://react-hook-form.com/get-started#Applyvalidation)
- Out of the box integration with [UI libraries](https://codesandbox.io/s/react-hook-form-v7-controller-5h1q5)
- [Small size](https://bundlephobia.com/result?p=react-hook-form@latest) and no [dependencies](./package.json)
- Support [Yup](https://github.com/jquense/yup), [Zod](https://github.com/vriad/zod), [AJV](https://github.com/ajv-validator/ajv), [Superstruct](https://github.com/ianstormtaylor/superstruct), [Joi](https://github.com/hapijs/joi), [Vest](https://github.com/ealush/vest), [class-validator](https://github.com/typestack/class-validator), [io-ts](https://github.com/gcanti/io-ts), [nope](https://github.com/bvego/nope-validator) and custom build

### Install

    npm install react-hook-form

### Quickstart

```jsx
import React from 'react';
import { useForm } from 'react-hook-form';

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('firstName')} />
      <input {...register('lastName', { required: true })} />
      {errors.lastName && <p>Last name is required.</p>}
      <input {...register('age', { pattern: /\d+/ })} />
      {errors.age && <p>Please enter number for age.</p>}
      <input type="submit" />
    </form>
  );
}
```

<a href="https://ui.dev/bytes/?r=bill">
  <img src="https://raw.githubusercontent.com/react-hook-form/react-hook-form/master/docs/ads-1.jpeg" />
</a>

### Sponsors

Thanks go to these kind and lovely sponsors (companies and individuals)!

<a
    target = _blank
    href = 'https://wantedlyinc.com'
/>
    <img
        width = 94
        src = 'https://images.opencollective.com/wantedly/d94e44e/logo/256.png'
    />
</a>
<a
    target = _blank
    href = 'https://underbelly.is'
/>
    <img
        width = 94
        src = 'https://images.opencollective.com/underbelly/989a4a6/logo/256.png'
    />
</a>
<a
    target = _blank
    href = 'https://leniolabs.com'
/>
    <img
        width = 94
        src = 'https://images.opencollective.com/leniolabs_/63e9b6e/logo/256.png'
    />
</a>
<a
    target = _blank
    href = 'https://graphcms.com'
/>
    <img
        width = 94
        src = 'https://avatars.githubusercontent.com/u/31031438'
    />
</a>
<a
    target = _blank
    href = 'https://kanamekey.com'
/>
    <img
        width = 94
        src = 'https://images.opencollective.com/kaname/d15fd98/logo/256.png'
    />
</a>
<a
    target = _blank
    href = 'https://feathery.io'
/>
    <img
        width = 94
        src = 'https://images.opencollective.com/feathery1/c29b0a1/logo/256.png'
    />
</a>
<a
    target = _blank
    href = 'https://getform.io'
/>
    <img
        width = 94
        src = 'https://images.opencollective.com/getformio2/3c978c8/avatar/256.png'
    />
</a><a href = 'https://github.com/sayav'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/42376060'
    />
</a>
<a href = 'https://github.com/lemcii'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/35668113'
    />
</a>
<a href = 'https://github.com/washingtonsoares'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/5726140'
    />
</a>
<a href = 'https://github.com/lixunn'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/4017964'
    />
</a>
<a href = 'https://github.com/SamSamskies'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/3655410'
    />
</a>
<a href = 'https://github.com/peaonunes'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/3356720'
    />
</a>
<a href = 'https://github.com/wilhelmeek'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/609452'
    />
</a>
<a href = 'https://github.com/iwarner'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/279251'
    />
</a>
<a href = 'https://github.com/joejknowles'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/10728145'
    />
</a>
<a href = 'https://github.com/chris-gunawardena'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/5763108'
    />
</a>
<a href = 'https://github.com/Tymek'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/2625371'
    />
</a>
<a href = 'https://github.com/Luchanso'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/2098777'
    />
</a>
<a href = 'https://github.com/vcarel'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/1541093'
    />
</a>
<a href = 'https://github.com/gragland'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/1481077'
    />
</a>
<a href = 'https://github.com/tjshipe'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/1254942'
    />
</a>
<a href = 'https://github.com/krnlde'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/1087002'
    />
</a>
<a href = 'https://github.com/msutkowski'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/784953'
    />
</a>
<a href = 'https://github.com/mlukaszczyk'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/599247'
    />
</a>
<a href = 'https://github.com/susshma'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/2566818'
    />
</a>
<a href = 'https://github.com/MatiasCiccone'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/32602795'
    />
</a>
<a href = 'https://github.com/ghostwriternr'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/10023615'
    />
</a>
<a href = 'https://github.com/neighborhood999'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/10325111'
    />
</a>
<a href = 'https://github.com/yjp20'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/44457064'
    />
</a>
<a href = 'https://github.com/samantha-wong'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/19571028'
    />
</a>
<a href = 'https://github.com/msc-insure'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/44406870'
    />
</a>
<a href = 'https://github.com/ccheney'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/302437'
    />
</a>
<a href = 'https://github.com/artischockee'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/22125223'
    />
</a>
<a href = 'https://github.com/tsongas'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/2079598'
    />
</a>
<a href = 'https://github.com/knoefel'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/2396344'
    />
</a>
<a href = 'https://github.com/JGibel'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/1953965'
    />
</a>
<a href = 'https://github.com/gpalrepo'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/41862257'
    />
</a>
<a href = 'https://github.com/pjsachdev'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/43356139'
    />
</a>
<a href = 'https://github.com/svict4'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/1137112'
    />
</a>
<a href = 'https://github.com/raisiqueira'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/2914170'
    />
</a>
<a href = 'https://github.com/pashtet422'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/45594821'
    />
</a>
<a href = 'https://github.com/ozywuli'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/5769153'
    />
</a>
<a href = 'https://github.com/monkey0722'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/12868063'
    />
</a>
<a href = 'https://github.com/KATT'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/459267'
    />
</a>
<a href = 'https://github.com/jeroenvisser101'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/1941348'
    />
</a>
<a href = 'https://github.com/sainu'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/12888685'
    />
</a>
<a href = 'https://github.com/bkincart'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/22803185'
    />
</a>
<a href = 'https://github.com/37108'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/36793907'
    />
</a>
<a href = 'https://github.com/TadejPolajnar'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/40028548'
    />
</a>
<a href = 'https://github.com/hahnlee'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/16930958'
    />
</a>
<a href = 'https://github.com/ACPK'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/2019893'
    />
</a>
<a href = 'https://github.com/alex-semenyuk'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/5480441'
    />
</a>
<a href = 'https://github.com/Peter-AMD'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/28400709'
    />
</a>
<a href = 'https://github.com/hjaber'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/41503068'
    />
</a>
<a href = 'https://github.com/jprosevear'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/699616'
    />
</a>
<a href = 'https://github.com/weisisheng'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/47701145'
    />
</a>
<a href = 'https://github.com/IanVS'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/4616705'
    />
</a>
<a href = 'https://github.com/anymaniax'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/10516382'
    />
</a>
<a href = 'https://github.com/rcmlee99'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/548371'
    />
</a>
<a href = 'https://github.com/sumant-k'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/42692074'
    />
</a>
<a href = 'https://github.com/reichhartd'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/34721312'
    />
</a>
<a href = 'https://github.com/alveshelio'>
    <img
        width = 45
        src = 'https://avatars.githubusercontent.com/u/8176422'
    />
</a>

### Backers

Thanks go to all our backers! [[Become a backer](https://opencollective.com/react-hook-form#backer)].

<a href="https://opencollective.com/react-hook-form#backers">
    <img src="https://opencollective.com/react-hook-form/backers.svg?width=950" />
</a>

### Contributors

Thanks go to these wonderful people! [[Become a contributor](CONTRIBUTING.md)].

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
  <img src="https://opencollective.com/react-hook-form/contributors.svg?width=890&button=false" />
</a>

### Helpers

Thank you for helping and answering questions from the community.

<a href = 'https://github.com/leapful'>
    <img
        width = 25
        src = 'https://avatars.githubusercontent.com/u/18494222'
    />
</a>
<a href = 'https://github.com/thanh-nguyen-95'>
    <img
        width = 25
        src = 'https://avatars.githubusercontent.com/u/44762180'
    />
</a>
<a href = 'https://github.com/slugmandrew'>
    <img
        width = 25
        src = 'https://avatars.githubusercontent.com/u/153625'
    />
</a>
<a href = 'https://github.com/lundn'>
    <img
        width = 25
        src = 'https://avatars.githubusercontent.com/u/4386964'
    />
</a>
<a href = 'https://github.com/ritikbanger'>
    <img
        width = 25
        src = 'https://avatars.githubusercontent.com/u/47841501'
    />
</a>
<a href = 'https://github.com/fahadsohail482'>
    <img
        width = 25
        src = 'https://avatars.githubusercontent.com/u/46647496'
    />
</a>
<a href = 'https://github.com/getTobiasNielsen'>
    <img
        width = 25
        src = 'https://avatars.githubusercontent.com/u/54803528'
    />
</a>
<a href = 'https://github.com/jfreedman0212'>
    <img
        width = 25
        src = 'https://avatars.githubusercontent.com/u/31392256'
    />
</a>
<a href = 'https://github.com/marr'>
    <img
        width = 25
        src = 'https://avatars.githubusercontent.com/u/44376'
    />
</a>
<a href = 'https://github.com/Moshyfawn'>
    <img
        width = 25
        src = 'https://avatars.githubusercontent.com/u/16290753'
    />
</a>

### Organizations

Thanks go to these wonderful organizations! [[Contribute](https://opencollective.com/react-hook-form/contribute)].

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/organizations.svg?width=890" />
</a>

<!--  -->

<!-- Generated @ 2022 / 07 / 13  23:45:26 -->
