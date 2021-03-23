import { createStore, declareAction, declareAtom, declareSmartAction, resetUniqId, Store } from '../src';
import { chooseProject } from './data/currentProject.atom';
import { Random } from './data/providers';

describe('actions', () => {
    beforeEach(() => {
        resetUniqId();
    });
    describe('declareAction', () => {
        test('action without type', () => {
            const setNum = declareAction<{ value: number }>();

            expect(setNum.type).toBe('action 1');
            const action = setNum({value: 10});
            expect(action.type).toBe('action 1');
            expect(action.payload).toEqual({
                value: 10,
            });

            // type asserts
            // @ts-expect-error
            setNum({value: '10'});
        });
        test('simple uniq action', () => {
            const setNum = declareAction<{ value: number }>('set num');

            expect(setNum.type).toBe('set num 1');
            const action = setNum({value: 10});
            expect(action.type).toBe('set num 1');
            expect(action.payload).toEqual({
                value: 10,
            });
        });
        test('simple strict action', () => {
            const setNum = declareAction<{ value: number }>(['set num']);

            expect(setNum.type).toBe('set num');
            const action = setNum({value: 10});
            expect(action.type).toBe('set num');
            expect(action.payload).toEqual({
                value: 10,
            });
        });
        test('simple strict action with number in type', () => {
            const setNum = declareAction<{ value: number }>(['set num', 5]);

            expect(setNum.type).toBe('set num/5');
            const action = setNum({value: 10});
            expect(action.type).toBe('set num/5');
            expect(action.payload).toEqual({
                value: 10,
            });
        });
        test('types', () => {
            const ac = declareAction<string>(() => 1);

        });
    });

    describe('declareSmartAction', () => {
        const store: Store = null as any;
        test('action without type', () => {
            const setNum = declareSmartAction((_, value: number) => ({value}));

            expect(setNum.type).toBe('action 1');
            const action = setNum(10, store);
            expect(action.type).toBe('action 1');
            expect(action.payload).toEqual({
                value: 10,
            });

            // type asserts
            // @ts-expect-error
            setNum({value: '10'});
        });
        test('simple uniq action', () => {
            const setNum = declareSmartAction('set num', (_, value: number) => ({value}));

            expect(setNum.type).toBe('set num 1');
            const action = setNum(10, store);
            expect(action.type).toBe('set num 1');
            expect(action.payload).toEqual({
                value: 10,
            });
        });
        test('simple strict action', () => {
            const setNum = declareSmartAction<{ value: number }, number>(['set num'], (_, value) => ({value}));

            expect(setNum.type).toBe('set num');
            const action = setNum(10, store);
            expect(action.type).toBe('set num');
            expect(action.payload).toEqual({
                value: 10,
            });

            // @ts-expect-error
            setNum('bad');
        });
        test('simple strict action with number in type', () => {
            const setNum = declareSmartAction<{ value: number }, number>(['set num', 5], (_, value) => ({value}));

            expect(setNum.type).toBe('set num/5');
            const action = setNum(10, store);
            expect(action.type).toBe('set num/5');
            expect(action.payload).toEqual({
                value: 10,
            });

            // @ts-expect-error
            setNum(true);
        });
    });

    describe('providers', () => {
        test('atom', () => {
            // arrange
            const store = createStore();

            const action = chooseProject({id: 1}, store);
            expect(chooseProject.type).toBe('choose project');
            expect(action.type).toBe('choose project');
            expect(action.payload).toEqual({
                id: 1,
                name: 'First project',
            });
        });
    });
});
