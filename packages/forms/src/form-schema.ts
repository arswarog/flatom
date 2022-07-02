import { Validators } from './validation/validators.types';

export type UpdateStrategy = 'change' | 'blur' | 'submit';

export interface AbstractControlSchema<TValue = any> {
    defaultValue?: TValue;
    /**
     * Свойство может иметь значение null
     */
    nullable?: boolean;
    updateOn?: UpdateStrategy;
    validators?: Validators;
}

export interface GroupControlSchema<TValue = any> extends AbstractControlSchema<TValue> {
    controls: {
        [key in keyof TValue]: GroupControlSchema<TValue[key]> | AbstractControlSchema<TValue[key]>;
    };
}

export interface FormControlSchema<TValue = any> extends GroupControlSchema<TValue> {
    id: string;
}

export function declareFormSchema<TValue = any>(schema: FormControlSchema<TValue>): FormControlSchema<TValue> {
    return schema;
}
