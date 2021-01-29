import { declareAction } from '../src';

describe('ActionCreator', () => {
    test('simple action', () => {
        const setNum = declareAction<{ value: number }>('set num');

        expect(setNum.type).toBe('set num');
        expect(setNum({value: 10})).toEqual({
            type: 'set num',
            payload: {
                value: 10,
            },
        });
    });
});
