import { createStore, declareAction, declareAtom, declareEffect, resetUniqId, Store } from './index';

describe('Store', () => {
    const setValue = declareAction<{ value: number }>('setValue');
    const atom = declareAtom('atom', {
        value: 0,
        action: '',
    }, on => [
        on(setValue, (state, payload) => ({
            action: 'setValue',
            value: payload.value,
        })),
    ], {
        setText: (state, text: string) => {
            return {
                value: +text,
                action: 'setText',
            };
        },
    });
    const relatedAtom = declareAtom('relatedAtom', {
        value: '',
        action: '',
    }, on => [
        on(atom, (state, {value}) => ({
            action: 'atom',
            value: value.toString(),
        })),
    ], {
        setDirectText: (state, text: string) => {
            return {
                value: text,
                action: 'setDirectText',
            };
        },
    });

    describe('getState', () => {
        const store = createStore();
        store.subscribe(atom, () => null);

        test('get not subscribed atom state', () => {
            expect(store.getState(relatedAtom)).toEqual({
                value: '',
                action: '',
            });
        });
        test('get all state', () => {
            expect(store.getState()).toEqual({
                atom: {
                    value: 0,
                    action: '',
                },
            });
        });
        test('get atom state', () => {
            expect(store.getState(atom)).toEqual({
                value: 0,
                action: '',
            });
        });
        test('get atom state with selector', () => {
            expect(store.getState(atom, ({value}) => value)).toEqual(0);
        });
    });
    describe('sequence', () => {
        let events: string[] = [];
        let store: Store = null as any;

        const actionFooMarker = declareAction(['foo marker']);

        const actionFoo = declareEffect(['foo'], async ({dispatch}) => {
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

            store = createStore({}, {trace: true});

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

                const actionBar = declareEffect(['bar'], ({dispatch}) => {
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
                const actionBar = declareEffect(['bar'], ({dispatch}) => {
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
        test('single atom', () => {
            // arrange
            const store = createStore();
            store.subscribe(atom, () => null);
            expect(store.getState(atom)).toEqual({
                value: 0,
                action: '',
            });

            // act
            store.dispatch(atom.setText('5'));

            // assert
            expect(store.getState(atom)).toEqual({
                value: 5,
                action: 'setText',
            });
            expect(store.getState()).toEqual({
                atom: {
                    value: 5,
                    action: 'setText',
                },
            });
        });
        test('related atom changes when dep atom was changed', () => {
            // arrange
            const store = createStore();
            store.subscribe(relatedAtom, () => null);

            // act
            store.dispatch(atom.setText('55'));

            // assert
            expect(store.getState()).toEqual({
                atom: {
                    value: 55,
                    action: 'setText',
                },
                relatedAtom: {
                    value: '55',
                    action: 'atom',
                },
            });
            expect(store.getState(atom)).toEqual({
                value: 55,
                action: 'setText',
            });
            expect(store.getState(relatedAtom)).toEqual({
                value: '55',
                action: 'atom',
            });
        });
        test('delete atom\'s data after unsubscribe', () => {
            // arrange
            const store = createStore();
            const subscription = store.subscribe(relatedAtom, () => null);

            store.dispatch(atom.setText('12'));
            expect(store.getState(atom)).toEqual({
                value: 12,
                action: 'setText',
            });
            expect(store.getState(relatedAtom)).toEqual({
                value: '12',
                action: 'atom',
            });

            // act
            subscription.unsubscribe();

            // assert
            expect(store.getState(relatedAtom)).toEqual({
                value: '',
                action: '',
            });
            expect(store.getState(atom)).toEqual({
                value: 0,
                action: '',
            });
            expect(store.getState()).toEqual({});
        });
        test('calculate state of new atoms then they init from their deps', () => {
            // arrange
            const store = createStore();
            store.subscribe(atom, () => null);

            store.dispatch(atom.setText('10'));
            expect(store.getState(atom)).toEqual({
                value: 10,
                action: 'setText',
            });

            // act
            store.subscribe(relatedAtom, () => null);
            expect(store.getState(relatedAtom)).toEqual({
                value: '10',
                action: 'atom',
            });
        });
        test('don not delete atom, if another atom subscribe for it', () => {
            // arrange
            let gcEvents = 0;
            const anotherRelatedAtom = declareAtom<{ value: number }>(
                'anotherRelatedAtom',
                {value: 0},
                on => on(atom, (_, {value}) => ({
                    value,
                })),
            );
            const store = createStore();
            store.onGarbageCollected(() => gcEvents++);
            const subscription = store.subscribe(relatedAtom, () => null);
            const subscription2 = store.subscribe(anotherRelatedAtom, () => null);

            store.dispatch(atom.setText('5'));
            expect(store.getState()).toEqual({
                atom: {
                    value: 5,
                    action: 'setText',
                },
                relatedAtom: {
                    value: '5',
                    action: 'atom',
                },
                anotherRelatedAtom: {
                    value: 5,
                },
            });

            // act 1
            subscription.unsubscribe();

            // assert
            expect(store.getState()).toEqual({
                atom: {
                    value: 5,
                    action: 'setText',
                },
                anotherRelatedAtom: {
                    value: 5,
                },
            });
            expect(gcEvents).toBe(1);
            gcEvents = 0;

            // act 2
            subscription2.unsubscribe();

            // assert
            expect(store.getState(relatedAtom)).toEqual({
                value: '',
                action: '',
            });
            expect(store.getState(atom)).toEqual({
                value: 0,
                action: '',
            });
            expect(store.getState()).toEqual({});
            expect(gcEvents).toBe(1);
        });
        test('subscribe for atoms', async () => {
            // arrange
            const store = createStore();
            let value: any;

            // act
            store.subscribe(atom, (state) => value = state);
            await store.dispatch(atom.setText('10'));

            // assert
            expect(value).toEqual({value: 10, action: 'setText'});
        });

        // todo: атом не удаляется если есть зависимые атомы
        // todo: проверить что удаляются ненужные атомы после удаления родительского

        test('subscribe for actions', async () => {
            // arrange
            const store = createStore();
            let value: any;

            // act
            store.subscribe(setValue, payload => value = payload);
            await store.dispatch(setValue({value: 10}));

            // assert
            expect(value).toEqual({value: 10});
        });
        test('unsubscribe', async () => {
            // arrange
            const store = createStore();
            let value: any;
            const subscription = store.subscribe(setValue, (payload) => value = payload);
            await store.dispatch(setValue({value: 10}));

            // act
            subscription.unsubscribe();

            // assert
            await store.dispatch(setValue({value: 10}));
            expect(value).toEqual({value: 10});
        });
        test('error in atom', () => {
            const atom = declareAtom('some', {}, on => on(setValue, () => {
                throw new Error('Some error');
            }));

            const store = createStore();
            store.subscribe(atom, () => null);

            expect(() => store.dispatch(setValue({value: 5}))).toThrow(`Some error`);
        });
    });
});

// TODO check atoms without initialState
// TODO subscribe for action by string type
