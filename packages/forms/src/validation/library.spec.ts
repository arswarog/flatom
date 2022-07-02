import { createSyncValidator } from './create-validator';
import { createValidatorsLibrary, ValidatorsLibrary } from './library';

describe('ValidatorsLibrary', () => {
    describe('validation', () => {
        it('custom validator without params', () => {
            const myRequired = createSyncValidator('myRequired', () => (value: unknown) => {
                if (value) {
                    return null;
                }

                return {
                    required: {},
                };
            });

            const requiredConfig = myRequired();

            expect(requiredConfig).toEqual(['myRequired']);

            const library = createValidatorsLibrary([myRequired]);
            const validatorFn = library.factory(requiredConfig) as any;

            expect(validatorFn(null)).toEqual({ required: {} });
            expect(validatorFn('')).toEqual({ required: {} });
            expect(validatorFn('value')).toEqual(null);
        });
        it('custom validator with params', () => {
            const myLength = createSyncValidator('myLength', (min: number, max: number) => (value: string) => {
                const actual = value.length;

                if (actual < min)
                    return {
                        length: { actual, min, max },
                    };

                if (actual > max)
                    return {
                        length: { actual, min, max },
                    };

                return null;
            });

            const validatorConfig = myLength(2, 5);

            expect(validatorConfig).toEqual(['myLength', 2, 5]);

            const library = createValidatorsLibrary([myLength]);
            const validatorFn = library.factory(validatorConfig) as any;

            expect(validatorFn('')).toEqual({ length: { actual: 0, min: 2, max: 5 } });
            expect(validatorFn('1')).toEqual({ length: { actual: 1, min: 2, max: 5 } });
            expect(validatorFn('123456')).toEqual({ length: { actual: 6, min: 2, max: 5 } });
            expect(validatorFn('123')).toEqual(null);
            expect(validatorFn(123)).toEqual(null);
        });
        it('custom async validator', async () => {
            expect.assertions(3);

            const checkCode = createSyncValidator('checkCode', () => (value: string) => {
                if (value === '1234') {
                    return null;
                } else
                    return {
                        invalidCode: {},
                    };
            });

            const validatorConfig = checkCode();

            expect(validatorConfig).toEqual(['checkCode']);

            const library = createValidatorsLibrary([checkCode]);
            const validatorFn = library.factory(validatorConfig) as any;

            Promise.resolve()
                .then(() => validatorFn('4321'))
                .then((value) => expect(value).toEqual({ invalidCode: {} }));
            Promise.resolve()
                .then(() => validatorFn('1234'))
                .then((value) => expect(value).toEqual(null));
        });
    });
});
