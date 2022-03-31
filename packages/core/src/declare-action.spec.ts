import { declareAction, declareEffect } from './declare-action';
import { Action, PayloadAction, SimpleAction } from './action.types';
import { createStore } from './store';

describe('declareAction', () => {
    describe('types', () => {
        it('one Action type for any case', () => {
            const action1: SimpleAction = {
                type: 'action1',
            };

            const action2: PayloadAction<number> = {
                type: 'action2',
                payload: 5,
            };

            const action2bad1: SimpleAction = {
                type: 'action2',
                // @ts-expect-error check for valid types
                payload: '5',
            };

            const action3: PayloadAction<void> = {
                type: 'action3',
                payload: undefined,
            };

            const action3bad1: PayloadAction<void> = {
                type: 'action3',
                // @ts-expect-error check for valid types
                payload: '5',
            };
        });
        it('dispatch declareEffect', async () => {
            const effect = declareEffect('effect', ({}, payload: string) => 5);
            const store = createStore();

            const action = effect('123');

            const result1: number = await store.dispatch(action);
            // @ts-expect-error check for invalid types
            const result2: string = await store.dispatch(action);
        });
    });
    describe('declareAction', () => {
        it('no params', () => {
            const ac = declareAction('action');

            const action: Action = ac();
            expect(action).toEqual({
                type: 'action',
            });
        });
        it('no params - types', () => {
            const ac = declareAction('action');

            const action: Action = ac();
            //@ts-expect-error check for valid types
            const action2: Action<number> = ac();
            //@ts-expect-error check for valid types
            const action3: Action<number> = ac(5);
            //@ts-expect-error check for valid types
            const action4: Action = ac(5);
        });
        it('string param', () => {
            const ac = declareAction<string>('action');

            const action: Action = ac('5');
            expect(action).toEqual({
                type: 'action',
                payload: '5',
            });
        });
        it('string param - types', () => {
            const ac = declareAction<string>('action');

            const action: PayloadAction<string> = ac('');
            //@ts-expect-error check for valid types
            const action2: PayloadAction<number> = ac();
            //@ts-expect-error check for valid types
            const action3: PayloadAction<number> = ac(5);
            //@ts-expect-error check for valid types
            const action4: PayloadAction<string, boolean> = ac('5');
        });
        it('dispatch PayloadAction', async () => {
            const effect = declareAction<string>('effect');
            const store = createStore();

            const action = effect('123');

            const result1: void = await store.dispatch(action);
            // @ts-expect-error check for invalid types
            const result2: string = await store.dispatch(action);
        });
        it('dispatch Action', async () => {
            const effect = declareAction('effect');
            const store = createStore();

            const action = effect();

            const result1: void = await store.dispatch(action);
            // @ts-expect-error check for invalid types
            const result2: string = await store.dispatch(action);
        });
    });
});
