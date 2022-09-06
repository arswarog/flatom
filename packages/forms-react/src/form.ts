import { FunctionComponent, ReactNode, SyntheticEvent } from 'react';
import * as React from 'react';
import { FormControl } from '@flatom/forms';
import { FlatomFormContext } from './context';
export interface OnFormSubmit<TValue = any> {
    (values: TValue | null, form: FormControl<TValue | null>): Promise<void> | void;
}

export interface IFlatomFormProps<TValue = any> {
    form: FormControl<TValue>;

    onSubmit?: OnFormSubmit<TValue>;
    onSubmitInvalid?: OnFormSubmit<TValue>;

    children?: ReactNode | undefined;
}

export function FlatomForm<TValue = any>({ form, ...props }: IFlatomFormProps<TValue>): JSX.Element {
    const onSubmitHandler = (event: SyntheticEvent) => {
        event.preventDefault();

        form.valid ? props.onSubmit?.(form.value, form as any) : props.onSubmitInvalid?.(form.value, form as any);
    };

    return React.createElement(
        FlatomFormContext.Provider,
        { value: form },
        React.createElement('form', { onSubmit: onSubmitHandler }, props.children),
    );
}
