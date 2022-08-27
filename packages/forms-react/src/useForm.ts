import {
    createValidatorsLibrary,
    FormControl,
    FormControlSchema,
    FormValidators,
    ReadonlyControl,
    ValidationErrorMessages,
} from '@flatom/forms';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '@flatom/react';

export function useForm<TValue = any>(
    schema: FormControlSchema<TValue>,
    validators: FormValidators = [],
    messages: ValidationErrorMessages = {},
): FormControl<TValue> {
    const formRef = useRef<FormControl<TValue>>();
    const store = useStore();

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
