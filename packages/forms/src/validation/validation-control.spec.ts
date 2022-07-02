import { createValidatorsLibrary, ValidatorsLibrary } from './library';
import { ValidationControl } from './validation-control';

describe('ValidationControl', () => {
    describe('error messages', () => {
        let library: ValidatorsLibrary;
        let validationControl: ValidationControl;

        beforeEach(() => {
            library = createValidatorsLibrary([], {
                required: 'Field is required',
                min: 'Value must be more then {min}',
                max: (error) => `Value must be less then ${error.max}`,
            });

            validationControl = new ValidationControl({ library });
        });

        it('get first error', () => {
            const error = validationControl.getFirstError({
                required: {},
                min: { actual: 0, min: 10 },
            });

            expect(error).toBe('Field is required');
        });
        it('get all errors', () => {
            const errors = validationControl.getAllErrors({
                required: {},
                min: { actual: 0, min: 10 },
                max: { actual: 0, max: -10 },
            });

            expect(errors.size).toBe(3);
            expect(errors.get('required')).toBe('Field is required');
            expect(errors.get('min')).toBe('Value must be more then 10');
            expect(errors.get('max')).toBe('Value must be less then -10');
        });
        it('redefined messages', () => {
            const errors = validationControl.getAllErrors(
                {
                    required: {},
                    min: { actual: 0, min: 10 },
                },
                {
                    required: 'Field must be present',
                },
            );

            expect(errors.size).toBe(2);
            expect(errors.get('required')).toBe('Field must be present');
            expect(errors.get('min')).toBe('Value must be more then 10');
        });
        it('should throw error if message not defined', () => {
            expect(() =>
                validationControl.getAllErrors({
                    unknown: {},
                }),
            ).toThrow();
        });
        it('getFirstError should return empty string for no error', () => {
            expect(validationControl.getFirstError({})).toBe('');
        });
        it('getFirstError should return empty string for null', () => {
            expect(validationControl.getFirstError(null)).toBe('');
        });
        it('getAllErrors should return empty map for no error', () => {
            expect(validationControl.getAllErrors({}).size).toBe(0);
        });
        it('getAllErrors should return empty map for null', () => {
            expect(validationControl.getAllErrors(null).size).toBe(0);
        });
    });
});
