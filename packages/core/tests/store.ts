import { createStore, declareAction, declareAtom, resetUniqId, Store } from '../src';
import { CurrentProjectAtom, incrementChildNum, setChildNum } from './data/currentProject.atom';
import { ParentAtom } from './data/parent.atom';
import { IProject, ProjectsAtom } from './data/projects.atom';

describe('Store', () => {
    beforeEach(() => resetUniqId());
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
    describe('sequence', () => {
        let events: string[] = [];
        let store: Store = null as any;

        const actionFooMarker = declareAction(['foo marker']);

        const actionFoo = declareAction(['foo'], async ({dispatch}) => {
            events.push('reaction foo');
            await wait();
            return dispatch(actionFooMarker());
        });

        const atomFoo = declareAtom('atomFoo', 0, on => on(actionFoo, (state) => {
            events.push('reducer foo');
            return state + 1;
        }));

        beforeEach(() => {
            events = [];

            store = createStore();

            store.debugAPI.onStateChanged((_, action) => events.push('state changed by action "' + action.type + '"'));
            store.subscribe(() => events.push('subscription state'));
            store.subscribe(atomFoo, () => events.push('subscription atom foo'));
            store.subscribe(actionFoo, () => {
                events.push('subscription action foo');
            });
            store.subscribe(actionFooMarker, () => events.push('subscription action foo marker'));
        });

        const delay = (timeout = 0) => new Promise(resolve => setTimeout(resolve, timeout));
        const wait = () => new Promise(resolve => setTimeout(resolve));

        test('single dispatch', () => {
            return new Promise<void>((resolve) => {
                // act
                store.dispatch(actionFoo())
                     .then(() => {
                         // assert
                         expect(events).toEqual([
                             'reducer foo',
                             'state changed by action "foo"',
                             'reaction foo',
                             'after sync dispatch foo',
                             'subscription action foo',
                             'subscription atom foo',
                             'subscription state',
                             'state changed by action "foo marker"',
                             'subscription action foo marker',
                         ]);
                         resolve();
                     });

                events.push('after sync dispatch foo');
            });
        });
        test('dispatch in action subscription', () => {
            return new Promise<void>((resolve) => {
                // arrange
                const actionImmediate = declareAction(['immediate']);

                const atomImmediate = declareAtom(['immediate'], 0, on => on(actionImmediate, state => state + 1));

                const actionBar = declareAction(['bar'], ({dispatch}) => {
                    events.push('reaction bar');
                    dispatch(actionFoo());
                    events.push('after sync dispatch foo');
                });

                const atomBar = declareAtom('bar', 0, on => on(actionBar, state => {
                    events.push('reducer bar');
                    return state + 1;
                }));

                store.subscribe(actionFoo, () => store.dispatch(actionImmediate()));
                store.subscribe(actionBar, () => events.push('subscription action bar'));
                store.subscribe(atomBar, () => events.push('subscription atom bar'));
                store.subscribe(atomImmediate, () => events.push('subscription atom immediate'));

                const interval = setInterval(() => events.push('setTimeout'));

                // act
                store.dispatch(actionBar())
                     .then(() => delay(1))
                     .then(() => {
                         // assert
                         expect(events).toEqual([
                             'reducer bar',
                             'state changed by action "bar"',
                             'reaction bar',
                             'reducer foo',
                             'state changed by action "foo"',
                             'reaction foo',
                             'after sync dispatch foo',
                             'after sync dispatch bar',
                             'subscription action bar',
                             'subscription action foo',
                             'state changed by action "immediate"',
                             'subscription atom bar',
                             'subscription atom foo',
                             'subscription atom immediate',
                             'subscription state',
                             'setTimeout',
                             'state changed by action "foo marker"',
                             'subscription action foo marker',
                         ]);
                         clearInterval(interval);
                         resolve();
                     });

                events.push('after sync dispatch bar');
            });
        });
        test('sync dispatch in reaction', () => {
            return new Promise<void>((resolve) => {
                // arrange
                const actionBar = declareAction(['bar'], ({dispatch}) => {
                    events.push('reaction bar');
                    dispatch(actionFoo());
                    events.push('after sync dispatch foo');
                });

                const atomBar = declareAtom('bar', 0, on => on(actionBar, state => {
                    events.push('reducer bar');
                    return state + 1;
                }));

                store.subscribe(actionBar, () => events.push('subscription action bar'));
                store.subscribe(atomBar, () => events.push('subscription atom bar'));

                // act
                const interval = setInterval(() => events.push('setTimeout'));

                store.dispatch(actionBar())
                     .then(wait)
                     .then(() => {
                         // assert
                         expect(events).toEqual([
                             'reducer bar',
                             'state changed by action "bar"',
                             'reaction bar',
                             'reducer foo',
                             'state changed by action "foo"',
                             'reaction foo',
                             'after sync dispatch foo',
                             'after sync dispatch bar',
                             'subscription action bar',
                             'subscription action foo',
                             'subscription atom bar',
                             'subscription atom foo',
                             'subscription state',
                             'setTimeout',
                             'state changed by action "foo marker"',
                             'subscription action foo marker',
                         ]);
                         clearInterval(interval);
                         resolve();
                     });

                events.push('after sync dispatch bar');
            });
        });

        describe('error in reactions', () => {});
        describe('error in subscribers', () => {});
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
        test('subscribe for atoms', async () => {
            // arrange
            const store = createStore();
            let value: any;

            // act
            store.subscribe(CurrentProjectAtom, (state) => value = state);
            await store.dispatch(setChildNum({value: 10}));

            // assert
            expect(value).toEqual({num: 10});
        });
        test('subscribe twice for same atom', () => {
            // arrange
            const store = createStore();

            // act
            const sub1 = store.subscribe(CurrentProjectAtom, () => null);
            store.dispatch(incrementChildNum());
            expect(store.getState(CurrentProjectAtom)).toEqual({num: 1});
            sub1.unsubscribe();

            store.subscribe(CurrentProjectAtom, () => null);
            store.dispatch(incrementChildNum());

            // assert
            expect(store.getState(CurrentProjectAtom)).toEqual({num: 1});
        });

        // todo: атом не удаляется если есть зависимые атомы
        // todo: проверить что удаляются ненужные атомы после удаления родительского

        test('subscribe for actions', async () => {
            // arrange
            const store = createStore();
            let value: any;

            // act
            store.subscribe(setChildNum, payload => value = payload);
            await store.dispatch(setChildNum({value: 10}));

            // assert
            expect(value).toEqual({value: 10});
        });
        test('unsubscribe', async () => {
            // arrange
            const store = createStore();
            let value: any;
            const subscription = store.subscribe(setChildNum, (payload) => value = payload);
            await store.dispatch(setChildNum({value: 10}));

            // act
            subscription.unsubscribe();

            // assert
            await store.dispatch(setChildNum({value: 10}));
            expect(value).toEqual({value: 10});
        });
        test('error in atom', () => {
            const atom = declareAtom('some', {}, on => on(setChildNum, () => {
                throw new Error('Some error');
            }));

            const store = createStore();
            store.subscribe(atom, () => null);

            expect(() => store.dispatch(setChildNum({value: 5}))).toThrow(`Some error`);
        });
    });
    describe('resolve', () => {
        test('more then one providers', () => {
            // arrange
            const store = createStore();

            // act
            const currentProject = store.resolver.resolve(CurrentProjectAtom);

            // assert
            expect(currentProject).toEqual({
                num: 0,
            });
        });
        test('more then one providers', () => {
            // arrange
            const store = createStore();

            // act
            const [currentProject, projects] = store.resolver.resolveMany([CurrentProjectAtom, ProjectsAtom]);

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


// TODO check atoms without initialState
// TODO subscribe for action by string type
