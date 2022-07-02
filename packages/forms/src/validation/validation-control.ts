import { ReadonlyControl } from '../readonly-control';

import { ValidatorsLibrary } from './library';
import {
    AbstractValidator,
    AsyncValidatorFn,
    SyncValidatorFn,
    ValidationErrorMessages,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from './validators.types';

export interface ValidatorsControl {
    setValidators(validators: Validators): void;

    addValidators(validators: Validators, before?: AbstractValidator): void;

    removeValidators(validators: Validators): void;

    hasValidator(validator: ValidatorFn): boolean;

    clearValidators(): void;

    syncValidate(value: any): ValidationErrors | null;

    asyncValidate(value: any): Promise<ValidationErrors | null>;

    getFirstError(errors: ValidationErrors, messages?: ValidationErrorMessages): string;

    getAllErrors(errors: ValidationErrors, messages?: ValidationErrorMessages): Map<string, string>;
}

export interface ValidationControlProps {
    library: ValidatorsLibrary;
    timeout?: number;
}

export class ValidationControl implements ValidatorsControl {
    public readonly defaultTimeout: number;

    private syncValidators: SyncValidatorFn[] = [];
    private asyncValidators: AsyncValidatorFn[] = [];

    private readonly library: ValidatorsLibrary;

    constructor({ library, timeout }: ValidationControlProps) {
        this.defaultTimeout = 30000;
        this.library = library;
    }

    setValidators(validators: Validators): void {
        const all = validators.map((validator) => this.library.factory(validator));

        this.syncValidators = all.filter((validator) => validator.sync === true) as SyncValidatorFn[];
        this.asyncValidators = all.filter((validator) => validator.sync === false) as AsyncValidatorFn[];
    }

    addValidators(validators: Validators, before?: AbstractValidator): void {
        throw new Error('not implemented');
    }

    clearValidators(): void {
        throw new Error('not implemented');
    }

    hasValidator(validator: ValidatorFn): boolean {
        throw new Error('not implemented');
    }

    removeValidators(validators: Validators): void {
        throw new Error('not implemented');
    }

    syncValidate(control: ReadonlyControl<any>): ValidationErrors | null {
        for (const validator of this.syncValidators) {
            const errors = validator(control.value, control, {} as any);

            if (errors) {
                return errors;
            }
        }

        return null;
    }

    async asyncValidate(control: ReadonlyControl<any>): Promise<ValidationErrors | null> {
        return null;
    }

    getFirstError(errors: ValidationErrors | null, additionalMessages?: ValidationErrorMessages): string {
        if (!errors) {
            return '';
        }

        const error = Object.keys(errors)[0];

        if (error) {
            return this.library.getErrorMessage(error, errors[error], additionalMessages);
        }

        return '';
    }

    getAllErrors(errors: ValidationErrors | null, additionalMessages?: ValidationErrorMessages): Map<string, string> {
        const result = new Map<string, string>();

        if (errors) {
            Object.entries(errors).forEach(([key, error]) =>
                result.set(key, this.library.getErrorMessage(key, error, additionalMessages)),
            );
        }

        return result;
    }
}
