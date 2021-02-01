import { createStore } from '../src';
import { ChildAtom, setChildNum } from './data/child.atom';
import { ParentAtom } from './data/parent.atom';

describe('Store', () => {
    describe('atoms', () => {
        test('subscribe but not change', () => {
            // arrange
            const store = createStore();

            // act
            store.subscribe(ChildAtom);

            // assert
            expect(store.getState()).toEqual({});
            expect(store.getState(ChildAtom)).toEqual({
                num: 0,
            });
        });
        test('simple atom', () => {
            // arrange
            const store = createStore();
            store.subscribe(ChildAtom);

            // act
            store.dispatch(setChildNum({value: 5}));

            // assert
            expect(store.getState(ChildAtom)).toEqual({
                num: 5,
            });
            expect(store.getState()).toEqual({
                child: {
                    num: 5,
                },
            });
        });
        test('related atom', () => {
            // arrange
            const store = createStore();
            store.subscribe(ParentAtom);

            // act
            store.dispatch(setChildNum({value: 5}));

            // assert
            expect(store.getState()).toEqual({
                parent: {
                    childNum: 5,
                    str: 'test',
                },
                child: {
                    num: 5,
                },
            });
            expect(store.getState(ParentAtom)).toEqual({
                childNum: 5,
                str: 'test',
            });
            expect(store.getState(ChildAtom)).toEqual({
                num: 5,
            });
        });
        test('delete unsubscribed atom', () => {
            // arrange
            const store = createStore();
            const subscription = store.subscribe(ParentAtom);

            store.dispatch(setChildNum({value: 5}));

            // act
            subscription.unsubscribe();

            // assert
            expect(store.getState(ParentAtom)).toEqual({
                childNum: 0,
                str: 'test',
            });
            expect(store.getState(ChildAtom)).toEqual({
                num: 0,
            });
            expect(store.getState()).toEqual({});
        });
    });
    describe('subscriptions', () => {
        test('subscribe for atoms', () => {
            // arrange
            const store = createStore();
            let value: any;

            // act
            store.subscribe(ChildAtom, (state) => value = state);
            store.dispatch(setChildNum({value: 10}));

            // assert
            expect(value).toEqual({num: 10});
        });
        test('subscribe for actions', () => {
            // arrange
            const store = createStore();
            let value: any;

            // act
            store.subscribe(setChildNum, (payload) => value = payload);
            store.dispatch(setChildNum({value: 10}));

            // assert
            expect(value).toEqual({value: 10});
        });
        test('unsubscribe', () => {
            // arrange
            const store = createStore();
            let value: any;
            const subscription = store.subscribe(setChildNum, (payload) => value = payload);
            store.dispatch(setChildNum({value: 10}));

            // act
            subscription.unsubscribe();

            // assert
            store.dispatch(setChildNum({value: 10}));
            expect(value).toEqual({value: 10});
        });
    });
});
