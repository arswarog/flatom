import {
    Action,
    createStore,
    declareAction,
    resetUniqId,
} from '../src';
import { cartAtom } from '../../../examples/src/shop/models/cart/cart.atom';

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

    describe('builtInActions', () => {
        it('action with payload', () => {
            // @ts-expect-error
            cartAtom.addItem();
            // @ts-expect-error
            cartAtom.addItem('bad type');
            const action: Action = cartAtom.addItem(5);
            expect(action).toEqual({
                type: 'cart:addItem',
                payload: 5,
            });
        });
        it('action without payload', () => {
            // // @ts-expect-error
            // cartAtom.clear('bad type');
            // expect(cartAtom.clear()).toEqual({
            //     type: 'cart:clear',
            // });
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
