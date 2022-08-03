# @flatom/react

Package for debugging [Flatom](https://github.com/arswarog/flatom) via Redux DevTools.

[![npm](https://img.shields.io/npm/v/@flatom/debug?style=flat-square)](https://www.npmjs.com/package/@flatom/debug)
![npm type definitions](https://img.shields.io/npm/types/@flatom/debug?style=flat-square)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@flatom/debug?style=flat-square)](https://bundlephobia.com/result?p=@flatom/debug)
![GitHub](https://img.shields.io/github/license/arswarog/flatom?style=flat-square)

## Install

`npm i @flatom/debug`

or

`yarn add @flatom/debug`

> `@flatom/debug` depends on `@flatom/core`.

## Usage

### Step 1. Connect to redux dev tools

```tsx
import { createStore } from '@flatom/core'
import { connectReduxDevtools } from '@flatom/debug'

const store = createStore();
connectReduxDevtools(store);
```
