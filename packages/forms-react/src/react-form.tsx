import * as React from 'react';
import {
    createContext,
    FC,
    FunctionComponent,
    ReactNode,
    SyntheticEvent,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';

import { useSyncExternalStore } from 'use-sync-external-store/shim';

import {
    createValidatorsLibrary,
    FormControl,
    FormControlSchema,
    FormValidators,
    ValidationErrorMessages,
    ReadonlyControl,
    FieldControl,
} from '@flatom/forms';
import { useStore } from '@flatom/react';

export interface OnFormSubmit<TValue = any> {
    (values: TValue | null, form: FormControl<TValue | null>): Promise<void> | void;
}

export interface IFlatomFormProps<TValue = any> {
    form: FormControl<TValue>;

    onSubmit?: OnFormSubmit<TValue>;

    children?: ReactNode | undefined;
}

export const FlatomFormContext = createContext<FormControl>(null as any);

export const FlatomForm: FunctionComponent<IFlatomFormProps<unknown>> = function FlatomForm<TValue = any>({
    form,
    ...props
}: IFlatomFormProps<TValue>) {
    const onSubmitHandler = (event: SyntheticEvent) => {
        event.preventDefault();

        form.valid && props.onSubmit && props.onSubmit(form.value, form as any);
    };

    return (
        <FlatomFormContext.Provider value={form}>
            <form onSubmit={onSubmitHandler}>{props.children}</form>
        </FlatomFormContext.Provider>
    );
};

export function useForm<TValue = any>(
    schema: FormControlSchema<TValue>,
    validators: FormValidators = [],
    messages: ValidationErrorMessages = {},
): FormControl<TValue> {
    const store = useStore();
    const formRef = useRef<FormControl<TValue>>();

    if (!formRef.current) {
        const library = createValidatorsLibrary(validators, messages);

        formRef.current = new FormControl<TValue>(schema, store, { library });
    }

    const form = formRef.current;

    const [_, setState] = useState<ReadonlyControl>();

    useEffect(() => {
        return form.onStateChange((ctrl) => {
            setTimeout(() => setState(ctrl));
        });
    }, [form]);

    return form;
}

export function useField<TValue = any>(field: string) {
    const store = useStore();
    const context = useContext(FlatomFormContext);
    const control = context.getControl(field) as FieldControl<TValue>;

    return useSyncExternalStore(
        (cb) =>
            store.subscribe(control.atom, () => {
                cb();
            }),
        () => control.agent,
    );
}
