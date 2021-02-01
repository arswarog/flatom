import { createStore } from '../src';
import { ChildAtom, setChildNum } from './data/child.atom';
import { ParentAtom } from './data/parent.atom';

describe('Store', () => {
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
        expect(store.getState(ParentAtom)).toEqual({
            childNum: 5,
            str: 'test',
        });
        expect(store.getState(ChildAtom)).toEqual({
            num: 5,
        });
        expect(store.getState()).toEqual({
            parent: {
                childNum: 5,
                str: 'test',
            },
            child: {
                num: 5,
            },
        });
    });
});
