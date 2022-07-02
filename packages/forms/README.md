# @flatom/forms

Forms for [Flatom](https://github.com/arswarog/flatom).

[![npm](https://img.shields.io/npm/v/@flatom/forms?style=flat-square)](https://www.npmjs.com/package/@flatom/forms)
![npm type definitions](https://img.shields.io/npm/types/@flatom/forms?style=flat-square)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@flatom/forms?style=flat-square)](https://bundlephobia.com/result?p=@flatom/forms)
![GitHub](https://img.shields.io/github/license/arswarog/flatom?style=flat-square)

## Install

`npm i @flatom/forms`

or

`yarn add @flatom/forms`

> `@flatom/forms` depends on `@flatom/core`.

## Usage

### Step 1. Connect to redux dev tools

```tsx
import { createStore } from '@flatom/core'
import { connectReduxDevtools } from '@flatom/debug'

const store = createStore();
connectReduxDevtools(store);
```

// pvm publish -s all --canary
