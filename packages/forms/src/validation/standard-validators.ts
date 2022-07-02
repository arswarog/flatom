import { createSyncValidator } from './create-validator';
import { ValidatorFactory } from './validators.types';

export const required = createSyncValidator('required', () => (value: unknown) => {
    return value == null ? { required: {} } : null;
});
export const requiredTruthy = createSyncValidator('requiredTruthy', () => (value: unknown) => {
    return !value ? { requiredTruthy: {} } : null;
});
export const isNumber = createSyncValidator('number', () => (value: unknown) => {
    return typeof value === 'number' && !Number.isNaN(value)
        ? null
        : {
              number: {},
          };
});
export const min = createSyncValidator('min', (min: number) => (actual: unknown) => {
    if (typeof actual !== 'number') {
        return {
            number: {},
        };
    }
    return actual < min ? { min: { actual, min } } : null;
});
export const max = createSyncValidator('max', (max: number) => (actual: unknown) => {
    if (typeof actual !== 'number') {
        return {
            number: {},
        };
    }
    return actual > max ? { max: { actual, max } } : null;
});

export const standardValidatorList: ValidatorFactory[] = [required, requiredTruthy, isNumber, min, max];
export const validators = {
    required,
    requiredTruthy,
    isNumber,
    min,
    max,
};
