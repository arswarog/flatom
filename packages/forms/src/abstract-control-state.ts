import { ValidationErrorMessages, ValidationErrors, Validators } from './validation';

export enum FormControlStatus {
    Valid = 'VALID',
    Invalid = 'INVALID',
    Pending = 'PENDING',
}

export interface AbstractControlState<TValue = any> {
    path: string;
    name: string;
    value: TValue | null;
    status: FormControlStatus;
    disabled: boolean;
    focused: boolean;
    dirty: boolean;
    touched: boolean;
    errors: ValidationErrors | null;
    firstErrorMessage: string;
    validators: Validators;
    errorMessages: ValidationErrorMessages;
}

export interface GroupControlState<TValue = Record<string, any>> extends AbstractControlState<TValue> {
    controls: { [key in keyof TValue]: AbstractControlState<TValue[key]> };
}
