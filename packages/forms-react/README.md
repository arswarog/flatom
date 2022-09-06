# @flatom/forms-react

React bindings for Forms of [Flatom](https://github.com/arswarog/flatom).

[![npm](https://img.shields.io/npm/v/@flatom/forms-react?style=flat-square)](https://www.npmjs.com/package/@flatom/forms-react)
![npm type definitions](https://img.shields.io/npm/types/@flatom/forms-react?style=flat-square)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@flatom/forms-react?style=flat-square)](https://bundlephobia.com/result?p=@flatom/forms-react)
![GitHub](https://img.shields.io/github/license/arswarog/flatom-react?style=flat-square)

## Install

`npm i @flatom/forms-react`

or

`yarn add @flatom/forms-react`

> `@flatom/forms` depends on `@flatom/core`, `@flatom/react` and `@flatom/forms`.

## Usage

### Step 1: Define you own validators and error messages
```ts
import { createSyncValidator } from '@flatom/forms';

const titleValidator = createSyncValidator('title', (prefix: string) => (value: string) => {
    if (value.startsWith(prefix)) {
        return null
    } else {
        return {
            prefixRequired: { prefix }
        }
    }
})                
                
const errorMessages: ValidationErrorMessages = {
    required: 'Required field',
    children: 'Please fill all fields',
    min: 'Value have to more then {min}',
    max: 'Value have to less then {max}',
    prefixRequired: 'Require prefix: {prefix}',
};
```

### Step 2. Define form schema

```ts
import { declareFormSchema, validators } from '@flatom/forms';

const formSchema = declareFormSchema({
    id: 'my-form',
    nullable: true,
    controls: {
        title: {
            defaultValue: '',
            validators: [validators.required(), titleValidator('prefix ')],
        },
        value: {
            defaultValue: 0,
            validators: [validators.required(),validators.min(1), validators.max(100)],
        },
    },
});
```

### Step 3: Create field

// todo

### Step 4: Create form

```tsx
const MyForm = ()=> {
    const form = useForm(addTransactionFormSchema, formValidators, errorMessages);

    return (
        <FlatomForm
            form={props.form}
            onSubmit={onSubmit}
            onSubmitInvalid={onSubmitInvalid}
        >
        </FlatomForm>
    )
}
```
