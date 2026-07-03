# App for browser e2e tests
## What?
This app is used for browser e2e testing.

## Why?
We simply want to test each react-hook-form functionality in a separated environment.
The current app folder is used for this purpose.

## How?
Each react-hook-form functionality (ex. formState, reset, useFieldArray) that we want to test is rendered at specific route (see app.tsx)
Vitest browser tests use those routes (you could navigate those routes for manual testing: http://localhost:3000/).
## How can be used:

```
  1. npm i && npm run dev
``` 
