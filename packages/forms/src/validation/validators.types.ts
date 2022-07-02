import { Store } from '@flatom/core';

import { ReadonlyControl } from '../readonly-control';

export type Validators = ValidatorParams[];

export interface AbstractValidator {
    type: string;
    sync: boolean;
}

export type ValidatorParams<ValidatorName extends string = any, TParams extends any[] = any> = [
    ValidatorName,
    ...TParams,
] & {
    _brand: 'ValidatorParams';
};

export type FormValidators = any[];

export type ValidationErrorMessages = Record<string, string | ((error: ValidationError) => string)>;

export interface ValidatorFactory<ValidatorName extends string = any, TValue = unknown, TParams extends any[] = any>
    extends AbstractValidator {
    (...params: TParams): ValidatorParams<ValidatorName, TParams>;

    factory: (...params: ValidatorParams<ValidatorName, TParams>) => ValidatorFn<TValue>;
}

export interface SyncValidatorFn<TValue = any> extends AbstractValidator {
    sync: true;

    (value: TValue, control: ReadonlyControl<TValue>, store: Store): ValidationErrors | null;
}

export interface AsyncValidatorFn<TValue = any> extends AbstractValidator {
    sync: false;

    (value: TValue, control: ReadonlyControl<TValue>, store: Store): Promise<ValidationErrors | null>;
}

export type ValidatorFn<TValue = any> = SyncValidatorFn<TValue> | AsyncValidatorFn<TValue>;

export interface ValidationError {
    [key: string]: any;
}

export type ValidationErrors = Record<string, ValidationError>;
