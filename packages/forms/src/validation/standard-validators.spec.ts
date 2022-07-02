import { createValidatorsLibrary, ValidatorsLibrary } from './library';
import { validators } from './standard-validators';
import { createStore, Store } from '@flatom/core';
import { FieldControl } from '../field-control';

describe('standard validators', () => {
    const library = createValidatorsLibrary([]);
    let store: Store;
    let control: FieldControl;

    beforeEach(() => {
        store = createStore();
        control = new FieldControl(null as any, 'value', store, { library }, { nullable: true });
    });

    describe('required', () => {
        const validator = library.factory(validators.required());

        it.each([0, false, true, 'string', 123])('no errors when value %o', (value) => {
            expect(validator(value, control, store)).toBeNull();
        });

        it.each([undefined, null])('errors when value %o', (value) => {
            expect(validator(value, control, store)).toEqual({
                required: {},
            });
        });
    });

    describe('requiredTruthy', () => {
        const validator = library.factory(validators.requiredTruthy());

        it.each([true, 'string', 123])('no errors when value %o', (value) => {
            expect(validator(value, control, store)).toBeNull();
        });

        it.each([undefined, null, false, 0])('errors when value %o', (value) => {
            expect(validator(value, control, store)).toEqual({
                requiredTruthy: {},
            });
        });
    });
    describe('number', () => {
        const validator = library.factory(validators.isNumber());

        it.each([undefined, null, false, true, 'string', Symbol(), {}, NaN])('value %o is not a number', (value) => {
            expect(validator(value, control, store)).toEqual({
                number: {},
            });
        });

        it.each([Infinity, 0, 0.11, -199])('errors when value %o', (value) => {
            expect(validator(value, control, store)).toBeNull();
        });
    });
    describe('min', () => {
        it.each([-20, -10, 10, 100, Infinity])('value %o more then -20', (value) => {
            const validator = library.factory(validators.min(-20));

            expect(validator(value, control, store)).toBeNull();
        });
        it.each([-10, 0, 20, 49, -Infinity])('value %o less then 50', (value) => {
            const validator = library.factory(validators.min(50));

            expect(validator(value, control, store)).toEqual({ min: { actual: value, min: 50 } });
        });
    });
    describe('max', () => {
        it.each([-19.9, -10, 10, 100, Infinity])('value %o more then -20', (value) => {
            const validator = library.factory(validators.max(-20));

            expect(validator(value, control, store)).toEqual({ max: { actual: value, max: -20 } });
        });
        it.each([-10, 0, 20, 49, 50, -Infinity])('value %o less then 50', (value) => {
            const validator = library.factory(validators.max(50));

            expect(validator(value, control, store)).toBeNull();
        });
        // it.each([null, undefined, true, false, 'str', NaN, Symbol(), {}])('value %o has wrong type', (value) => {
        //     const validator = library.factory(validators.max(50));
        //
        //     expect(validator(value, control, store)).toEqual({
        //         number: {
        //
        //         }
        //     });
        // });
    });
});
