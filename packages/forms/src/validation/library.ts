import { standardValidatorList } from './standard-validators';
import {
    ValidationError,
    ValidationErrorMessages,
    ValidationErrors,
    ValidatorFactory,
    ValidatorFn,
    ValidatorParams,
} from './validators.types';

export interface ValidatorsLibrary {
    has(type: string | ValidatorFactory): boolean;

    get(type: string | ValidatorFactory): ValidatorFactory;

    add(type: ValidatorFactory | ValidatorsLibrary[]): number;

    factory<ValidatorName extends string, TValue = unknown, TParams extends any[] = []>(
        params: ValidatorParams<ValidatorName, TParams>,
    ): ValidatorFn<TValue>;

    getErrorMessage(error: string, details: ValidationError, messages?: ValidationErrorMessages): string;
}

export function createValidatorsLibrary(
    baseValidators: ValidatorFactory<any, any, any>[],
    messages: ValidationErrorMessages = {},
): ValidatorsLibrary {
    const factories = new Map<string, ValidatorFactory>();

    [...standardValidatorList, ...baseValidators].forEach((factory) => factories.set(factory.type, factory));

    return {
        has,
        get,
        add,
        factory,
        getErrorMessage,
    };

    function has(type: string | ValidatorFactory): boolean {
        throw new Error('not implemented');
    }

    function get(validator: string | ValidatorFactory<any, any>): ValidatorFactory {
        const type = typeof validator === 'string' ? validator : validator.type;
        const factory = factories.get(type);

        if (!factory) {
            throw new Error(`Validator "${type}" does not registered`);
        }

        return factory;
    }

    function add(type: ValidatorFactory | ValidatorsLibrary[]): number {
        throw new Error('not implemented');
    }

    function factory<ValidatorName extends string, TParams extends any[] = any[]>([
        validator,
        ...params
    ]: ValidatorParams<ValidatorName, TParams>): ValidatorFn<unknown> {
        const factory = get(validator);

        // @ts-ignore all right, it's params
        const validatorFn = factory.factory(...params);

        validatorFn.type = factory.type;
        validatorFn.sync = factory.sync;

        return validatorFn;
    }

    function getErrorMessage(
        error: string,
        details: ValidationError,
        additionalMessages: ValidationErrorMessages = {},
    ): string {
        let message = additionalMessages[error];

        if (!message) {
            message = messages[error];
        }

        if (!message) {
            throw new Error(`Message for ${error} not found`);
        }

        let result = typeof message === 'function' ? message(details) : message;

        Object.keys(details).forEach((key) => {
            result = result.replaceAll('{' + key + '}', details[key]);
        });

        return result;
    }
}
