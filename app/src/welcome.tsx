import React from 'react';
import { Link } from 'react-router-dom' 

type PathObject = "label" | "value"
type Path = Record<PathObject, string>

type Item = {
  label: string,
  description: string,
  paths: Path[]
}

const items: Item[] = [
  {
    label: "AutoUnregister",
    description: "autoUnregister",
    paths: [
      {
        label: "should keep all inputs data when inputs get unmounted",
        value: "/autoUnregister"
      },
    ]
  },
  {
    label: "Basic",
    description: "form validation",
    paths: [
      {
        label: "should validate the form and reset the form",
        value: "/basic/onSubmit"
      },
      {
        label: "should validate the form with onTouched mode",
        value: "/basic/onTouched"
      },
      {
        label: "should validate the form with onBlur mode and reset the form",
        value: "/basic/onBlur"
      },
      {
        label: "should validate the form with onChange mode and reset the form",
        value: "/basic/onChange"
      }
    ]
  },
  {
    label: "BasicSchemaValidation",
    description: "basicSchemaValidation form validation",
    paths: [
      {
        label: "should validate the form with onSubmit mode",
        value: "/basic-schema-validation/onSubmit"
      },
      {
        label: "should validate the form with onBlur mode",
        value: "/basic-schema-validation/onBlur"
      },
      {
        label: "should validate the form with onChange mode",
        value: "basic-schema-validation/onChange"
      },
    ]
  },
  {
    label: "And so on...",
    description: "lorem ipsum",
    paths: []
  }
]

const Component : React.FC = () => (
  <div style={Page}>
    <div style={Title}>App for cypress automation</div>
    <div style={Subtitle}>Here you have the full list of the available testing routes:</div>
    {items.map(({label, description, paths} : Item) => (
      <div style={Item} key={label}>
        <div style={Label}>{label}</div>
        <div style={Description}>{description}</div>
        <div>
            {paths.map(({label, value} : Path) => <div style={path} key={value}><Link to={value} style={link}>{label}</Link></div>)}
        </div>
     </div>
  ))}
  </div>
)

const Page : object = {
  background: "#081229",
  minHeight: "100vh",
  color: "white",
  padding: "1rem",
  fontFamily: "Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif"
}

const Title : object = {
  fontSize: "4rem",
  fontWeight: "600",
  textAlign: "center",
  marginBottom: "1rem"
}

const Subtitle : object = {
  color: "#ec5990",
  marginBottom: "3rem",
  fontSize: "1.5rem",
  textAlign: "center"
}

const Item : object = {
  border: "1px solid #516391",
  padding: ".5rem",
  background: "#0f111d",
  marginBottom: "1rem"
}

const Label : object = {
  fontSize: "1.5rem",
  fontWeight: "600",
  marginBottom: ".5rem",
  display: "inline-block",
  paddingBottom: ".25rem",
  borderBottom: "2px solid #ec5990"
}

const Description : object = {
  fontSize: "1rem",
  marginBottom: ".5rem"
}

const path : object = {
  marginBottom: ".25rem"
}

const link : object = {
  fontSize: ".875rem",
  color: "#ec5990",
  textDecoration: "none"
}

export default Component