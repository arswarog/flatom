import { Store } from '@flatom/core';

import { ReadonlyControl } from '../readonly-control';

import { ValidatorFactory } from './validators.types';

export function createSyncValidator<ValidatorName extends string, TValue = unknown, TParams extends any[] = []>(
    name: ValidatorName,
    validatorFn: (
        ...params: TParams
    ) => (value: TValue, control: ReadonlyControl<TValue>, store: Store) => Record<string, any> | null,
): ValidatorFactory<ValidatorName, TValue, TParams> {
    const factory: any = (...params: TParams) => [name, ...params];

    factory.type = name;
    factory.sync = true;
    factory.factory = validatorFn;

    return factory;
}

export function createAsyncValidator<ValidatorName extends string, TValue = unknown, TParams extends any[] = []>(
    name: ValidatorName,
    validatorFn: (
        ...params: TParams
    ) => (value: TValue, control: ReadonlyControl<TValue>, store: Store) => Promise<Record<string, any> | null>,
): ValidatorFactory<ValidatorName, TValue, TParams> {
    const factory: any = (...params: TParams) => [name, ...params];

    factory.type = name;
    factory.sync = false;
    factory.factory = validatorFn;

    return factory;
}
