import React from 'react';
import { Link } from 'react-router-dom' 
import * as S from './styles'

type Item = {
  title: string,
  description: string,
  paths: string[][]
}

const items: Item[] = [
  {
    title: "AutoUnregister",
    description: "autoUnregister",
    paths: [["should keep all inputs data when inputs get unmounted", "/autoUnregister"]]
  },
  {
    title: "Basic",
    description: "form validation",
    paths: [
      ["should validate the form and reset the form", "/basic/onSubmit"],
      ["should validate the form with onTouched mode",  "/basic/onTouched"],
      ["should validate the form with onBlur mode and reset the form", "/basic/onBlur"],
      ["should validate the form with onChange mode and reset the form",  "/basic/onChange"]
    ]
  },
  {
    title: "BasicSchemaValidation",
    description: "basicSchemaValidation form validation",
    paths: [
      ["should validate the form with onSubmit mode", "/basic-schema-validation/onSubmit"],
      ["should validate the form with onBlur mode", "/basic-schema-validation/onBlur"],
      ["should validate the form with onChange mode", "basic-schema-validation/onChange"]
    ]
  },
  {
    title: "ConditionalField",
    description: "ConditionalField",
    paths: [
      ["should reflect correct form state and data collection", '/conditionalField']
    ]
  },
  {
    title: "Controller",
    description: "controller basic form validation",
    paths: [
      ["should validate the form and reset the form", '/controller/onSubmit'],
      ["should validate the form with onBlur mode and reset the form", '/controller/onBlur'],
      ["should validate the form with onChange mode and reset the form", '/controller/onChange']
    ]
  },
  {
    title: "CustomSchemaValidation",
    description: "customSchemaValidation form validation",
    paths: [
      ["should validate the form with onSubmit mode", '/customSchemaValidation/onSubmit'],
      ["should validate the form with onBlur mode", '/customSchemaValidation/onBlur'],
      ["should validate the form with onChange mode", '/customSchemaValidation/onChange']
    ]
  },
  {
    title: "DefaultValues",
    description: "defaultValues",
    paths: [
      ["should populate defaultValue for inputs", '/default-values'],
    ]
  },
  {
    title: "FormState",
    description: "form state",
    paths: [
      ["should return correct form state with onSubmit mode", '/formState/onSubmit'],
      ["should return correct form state with onChange mode", '/formState/onChange'],
      ["should return correct form state with onBlur mode", '/formState/onBlur'],
      ["should reset dirty value when inputs reset back to default with onSubmit mode", '/formState/onSubmit'],
      ["should reset dirty value when inputs reset back to default with onBlur mode", '/formState/onBlur'],
      ["should reset dirty value when inputs reset back to default with onChange mode", '/formState/onChange'],
    ]
  },
  {
    title: "FormStateWithNestedFields",
    description: "form state with nested fields",
    paths: [
      ['should return correct form state with onSubmit mode', '/formStateWithNestedFields/onSubmit'],
      ['should return correct form state with onChange mode', '/formStateWithNestedFields/onChange'],
      ['should return correct form state with onBlur mode', '/formStateWithNestedFields/onBlur'],
      ['should reset dirty value when inputs reset back to default with onSubmit mode','/formStateWithNestedFields/onSubmit' ],
      ['should reset dirty value when inputs reset back to default with onBlur mode', '/formStateWithNestedFields/onBlur'],
      ['should reset dirty value when inputs reset back to default with onChange mode', '/formStateWithNestedFields/onChange']
    ]
  },
  {
    title: "FormStateWithSchema",
    description: "form state with schema validation",
    paths: [
      ['should return correct form state with onSubmit mode', '/formStateWithSchema/onSubmit'],
      ['should return correct form state with onChange mode', '/formStateWithSchema/onChange'],
      ['should return correct form state with onBlur mode', '/formStateWithSchema/onBlur'],
      ['should reset dirty value when inputs reset back to default with onSubmit mode','/formStateWithSchema/onSubmit' ],
      ['should reset dirty value when inputs reset back to default with onBlur mode', '/formStateWithSchema/onBlur'],
      ['should reset dirty value when inputs reset back to default with onChange mode', '/formStateWithSchema/onChange']
    ]
  },
]

const Component : React.FC = () => {
  return (
    <div style={S.page}>
      <div style={S.title}>App for cypress automation</div>
      <div style={S.subtitle}>Here you have an example of the full list of the available testing routes:</div>
      {items.map(({title, description, paths} : Item) => (
        <div style={S.item} key={title}>
          <div style={S.label}>{title}</div>
          <div style={S.description}>{description}</div>
          <div>
            {paths.map(([label, url]) => <div style={S.path} key={`${url}-${label}`}><Link to={url} style={S.link}>{label}</Link></div>)}
          </div>
      </div>
    ))}
    </div>
  )
}



export default Component