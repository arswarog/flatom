# @flatom/react

React bindings package for [Flatom](https://github.com/arswarog/flatom) store.

[![npm](https://img.shields.io/npm/v/@flatom/react?style=flat-square)](https://www.npmjs.com/package/@flatom/react)
![npm type definitions](https://img.shields.io/npm/types/@flatom/react?style=flat-square)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@flatom/react?style=flat-square)](https://bundlephobia.com/result?p=@flatom/react)
![GitHub](https://img.shields.io/github/license/arswarog/flatom?style=flat-square)

## Install

`npm i @flatom/react`

or

`yarn add @flatom/react`

> `@flatom/react` depends on `@flatom/core`.

## Usage

### Step 1. Create store

```tsx
// App
import React from 'react'
import { createStore } from '@flatom/core'
import { StoreProvider } from '@flatom/react'
import { Form } from './components/Form'

export const App = () => {
    // create statefull context for atoms execution
    const store = createStore();

    return (
        <div className="App">
            <StoreProvider value={store}>
                <Form/>
            </StoreProvider>
        </div>
    );
}
```

### Step 2. Use in components

```tsx
// components/Form

import { declareAction, declareAtom } from '@flatom/core'
import { useAction, useAtom } from '@flatom/react'

const changeName = declareAction();
const nameAtom = declareAtom<string>(
    'name',
    '',
    on => [
        on(changeName, (state, payload) => payload),
    ],
);

export const Form = () => {
    const name = useAtom(nameAtom);
    const handleChangeName = useAction(e => changeName(e.target.value));

    return (
        <form>
            <label htmlFor="name">Enter your name</label>
            <input id="name" value={name} onChange={handleChangeName}/>
        </form>
    );
}
```

## Hooks Api

### useAtom

Connects the atom to the store represented in context and returns the state of the atom from the store (or default atom state).

#### Basic (useAtom)

```ts
const atomValue = useAtom(atom);
```

#### Depended value by selector

```ts
const atomValue = useAtom(atom, atomState => atomState[props.id], [props.id]);
```

#### Mount without subscription (for subscribing atoms to actions)

```ts
const atomValue = useAtom(atom, () => null, []);
```

### useAction

Binds action with dispatch to the store provided in the context.

#### Basic (useAction)

```ts
const handleDoSome = useAction(doSome);
```

#### Prepare payload for dispatch

```ts
const handleDoSome = useAction(value => doSome({ id: props.id, value }), [
  props.id,
]);
```

#### Conditional dispatch

If action creator don't return an action dispatch not calling.

```ts
const handleDoSome = useAction(payload => {
  if (condition) return doSome(payload);
}, []);
```
