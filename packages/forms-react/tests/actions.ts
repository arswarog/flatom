import { Action, declareAction, declareAtom, resetUniqId, uniqName } from '@flatom/core';

describe('actions', () => {
    beforeEach(() => {
        resetUniqId();
    });
    describe('declareAction', () => {
        test('action without type', () => {
            const setNum = declareAction<{ value: number }>();

            expect(setNum.type).toBe('action 1');
            const action = setNum({ value: 10 });
            expect(action.type).toBe('action 1');
            expect(action.payload).toEqual({
                value: 10,
            });

            // @ts-expect-error error if invalid type
            setNum({ value: '10' });
        });
        test('simple uniq action', () => {
            const setNum = declareAction<{ value: number }>(uniqName`set num`);

            expect(setNum.type).toBe('set num 1');
            const action = setNum({ value: 10 });
            expect(action.type).toBe('set num 1');
            expect(action.payload).toEqual({
                value: 10,
            });
        });
        test('simple strict action', () => {
            const setNum = declareAction<{ value: number }>('set num');

            expect(setNum.type).toBe('set num');
            const action = setNum({ value: 10 });
            expect(action.type).toBe('set num');
            expect(action.payload).toEqual({
                value: 10,
            });
        });
        test('simple strict action with number in type', () => {
            const setNum = declareAction<{ value: number }>(['set num', 5]);

            expect(setNum.type).toBe('set num/5');
            const action = setNum({ value: 10 });
            expect(action.type).toBe('set num/5');
            expect(action.payload).toEqual({
                value: 10,
            });
        });
        test('auto generating action name', () => {
            expect(uniqName()).toBe('action 1');
        });
        test('auto generating action name', () => {
            const setNum = declareAction<{ value: number }>(uniqName());

            expect(setNum.type).toBe('action 1');
        });
        test('types', () => {
            // @ts-expect-error first param must be a string
            declareAction<string>(() => 1);
        });
    });

    describe('builtInActions', () => {
        const atom = declareAtom('atom', { value: 0, action: '' })({
            setValue(_, value: number) {
                return {
                    value,
                    action: 'setValue',
                };
            },
            clear() {
                return {
                    value: 0,
                    action: 'clear',
                };
            },
        });

        it('action with payload', () => {
            // @ts-expect-error error if no params when it needs
            atom.a.setValue();
            // @ts-expect-error error if bad param type
            atom.a.setValue('bad type');
            const action: Action = atom.a.setValue(5);
            expect(action).toEqual({
                type: 'atom:setValue',
                payload: 5,
            });
        });
        it('action without payload', () => {
            // TODO
            // // @ts-expect-error
            // atom.clear('bad type');
            // expect(atom.clear()).toEqual({
            //     type: 'cart:clear',
            // });
        });
    });
});
