import { createStore, declareAtom } from '../src';
import { CurrentProjectAtom, incrementChildNum, setChildNum } from './data/currentProject.atom';
import { ParentAtom } from './data/parent.atom';
import { IProject, ProjectsAtom } from './data/projects.atom';

describe('Store', () => {
    describe('getState', () => {
        const store = createStore();
        store.subscribe(ParentAtom, () => null);

        test('get not subscribed atom state', () => {
            expect(store.getState(CurrentProjectAtom)).toEqual({
                num: 0,
            });
        });
        test('get all state', () => {
            expect(store.getState()).toEqual({
                child: {
                    num: 0,
                },
                parent: {
                    childNum: 0,
                    str: 'test',
                },
            });
        });
        test('get atom state', () => {
            expect(store.getState(ParentAtom)).toEqual({
                childNum: 0,
                str: 'test',
            });
        });
        test('get atom state with selector', () => {
            expect(store.getState(ParentAtom, ({childNum}) => childNum)).toEqual(0);
        });
    });
    describe('atoms', () => {
        test('simple atom', () => {
            // arrange
            const store = createStore();
            store.subscribe(CurrentProjectAtom, () => null);
            expect(store.getState(CurrentProjectAtom)).toEqual({
                num: 0,
            });

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
            expect(store.getState(ParentAtom)).toEqual({
                childNum: 5,
                str: 'test',
            });

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
        test('apply related atoms while init new atom', () => {
            // arrange
            const store = createStore();
            store.subscribe(CurrentProjectAtom, () => null);

            store.dispatch(setChildNum({value: 5}));
            expect(store.getState(CurrentProjectAtom)).toEqual({
                num: 5,
            });

            // act
            store.subscribe(ParentAtom, () => null);
            expect(store.getState(ParentAtom)).toEqual({
                childNum: 5,
                str: 'test',
            });
        });
        test('not delete unsubscribed atom, if exist another parent', () => {
            // arrange
            let gcEvents = 0;
            const AnotherParentAtom = declareAtom<{ childNum: number }>(
                'anotherParent',
                {childNum: 0},
                on => on(CurrentProjectAtom, (_, {num}) => ({
                    childNum: num,
                })),
            );
            const store = createStore();
            store.onGarbageCollected(() => gcEvents++);
            const subscription = store.subscribe(ParentAtom, () => null);
            const subscription2 = store.subscribe(AnotherParentAtom, () => null);

            store.dispatch(setChildNum({value: 5}));
            expect(store.getState()).toEqual({
                child: {
                    num: 5,
                },
                parent: {
                    childNum: 5,
                    str: 'test',
                },
                anotherParent: {
                    childNum: 5,
                },
            });

            // act 1
            subscription.unsubscribe();

            // assert
            expect(store.getState()).toEqual({
                child: {
                    num: 5,
                },
                anotherParent: {
                    childNum: 5,
                },
            });
            expect(gcEvents).toBe(1);
            gcEvents = 0;

            // act 2
            subscription2.unsubscribe();

            // assert
            expect(store.getState(ParentAtom)).toEqual({
                childNum: 0,
                str: 'test',
            });
            expect(store.getState(CurrentProjectAtom)).toEqual({
                num: 0,
            });
            expect(store.getState()).toEqual({});
            // expect(gcEvents).toBe(1); fixme
        });
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

        // todo: атом не удаляется если есть зависимые атомы
        // todo: проверить что удаляются ненужные атомы после удаления родительского

        test('subscribe for actions', () => {
            // arrange
            const store = createStore();
            let value: any;

            // act
            store.subscribe(setChildNum, payload => value = payload);
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
            const [currentProject, projects] = store.resolveAll([CurrentProjectAtom, ProjectsAtom]);

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
