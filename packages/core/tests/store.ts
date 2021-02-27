import { createStore } from '../src';
import { CurrentProjectAtom, incrementChildNum, setChildNum } from './data/currentProject.atom';
import { ParentAtom } from './data/parent.atom';
import { IProject, ProjectsAtom } from './data/projects.atom';
import { ValueProvider } from '../src/provider';

describe('Store', () => {
    describe('atoms', () => {
        test('subscribe but not change', () => {
            // arrange
            const store = createStore();

            // act
            store.subscribe(CurrentProjectAtom, () => null);

            // assert
            expect(store.getState()).toEqual({});
            expect(store.getState(CurrentProjectAtom)).toEqual({
                num: 0,
            });
        });
        test('simple atom', () => {
            // arrange
            const store = createStore();
            store.subscribe(CurrentProjectAtom, () => null);

            // act
            store.dispatch(setChildNum({value: 5}));

            // assert
            expect(store.getState(CurrentProjectAtom)).toEqual({
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
            store.subscribe(ParentAtom, () => null);

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
            expect(store.getState(CurrentProjectAtom)).toEqual({
                num: 5,
            });
        });
        test('delete unsubscribed atom', () => {
            // arrange
            const store = createStore();
            const subscription = store.subscribe(ParentAtom, () => null);

            store.dispatch(setChildNum({value: 5}));

            // act
            subscription.unsubscribe();

            // assert
            expect(store.getState(ParentAtom)).toEqual({
                childNum: 0,
                str: 'test',
            });
            expect(store.getState(CurrentProjectAtom)).toEqual({
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
            store.subscribe(CurrentProjectAtom, (state) => value = state);
            store.dispatch(setChildNum({value: 10}));

            // assert
            expect(value).toEqual({num: 10});
        });
        test('subscribe twice for same atom', () => {
            // arrange
            const store = createStore();

            // act
            const sub1 = store.subscribe(CurrentProjectAtom, () => null);
            store.dispatch(incrementChildNum({}));
            expect(store.getState(CurrentProjectAtom)).toEqual({num: 1});
            sub1.unsubscribe();

            store.subscribe(CurrentProjectAtom, () => null);
            store.dispatch(incrementChildNum({}));

            // assert
            expect(store.getState(CurrentProjectAtom)).toEqual({num: 1});
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
    describe('resolve', () => {
        test('more then one providers', () => {
            // arrange
            const store = createStore();

            // act
            const currentProject = store.resolve(CurrentProjectAtom);

            // assert
            expect(currentProject).toEqual({
                num: 0,
            });
        });
        test('more then one providers', () => {
            // arrange
            const store = createStore();

            // act
            const [currentProject, projects] = store.resolveAll(CurrentProjectAtom, ProjectsAtom);

            // assert
            expect(currentProject).toEqual({
                num: 0,
            });
            expect(projects).toEqual({
                list: new Map<number, IProject>([
                    [1, {id: 1, name: 'First project'}],
                    [2, {id: 2, name: 'Second project'}],
                ]),
            });
        });
    });
});
