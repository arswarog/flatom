import { Action, createStore, declareAction, declareAtom, declareEffect, Store } from './index';
import { delay, wait } from './utils';

describe('Store', () => {
    const setValue = declareAction<{ value: number }>('setValue');
    const atomActions = {
        setText: (state, text: string) => {
            return {
                value: +text,
                action: 'setText',
            };
        },
        inc: (state, _: void) => {
            return {
                value: state.value + 1,
                action: 'inc',
            };
        },
    };
    const atom = declareAtom('atom', {
        value: 0,
        action: '',
    })(
        (on) => [
            on(setValue, (state, payload) => ({
                action: 'setValue',
                value: payload.value,
            })),
        ],
        atomActions,
    );
    const relatedAtom = declareAtom('relatedAtom', {
        value: '',
        action: '',
    })(
        {
            setDirectText: (state, text: string) => {
                return {
                    value: text,
                    action: 'setDirectText',
                };
            },
        },
        (on) => [
            on(atom, (state, { value }) => ({
                action: 'atom',
                value: value.toString(),
            })),
        ],
    );

    describe('subscription', () => {
        describe('for store', () => {
            test('should receives every action', async () => {
                const store = createStore();

                const spy = jest.fn();
                store.subscribe(spy);

                await store.dispatch(setValue({ value: 5 }));

                expect(spy).toBeCalledTimes(1);
                expect(spy).toBeCalledWith({
                    type: setValue.type,
                    payload: {
                        value: 5,
                    },
                });
            });
        });
        describe('for atom', () => {
            test('should get every changes of atom', async () => {
                // arranged
                const store = createStore();

                const spy = jest.fn();
                store.subscribe(atom, spy);

                // act 1
                await store.dispatch(setValue({ value: 5 }));

                // assert 1
                expect(spy).toBeCalledTimes(1);
                expect(spy).toBeCalledWith(
                    {
                        action: 'setValue',
                        value: 5,
                    },
                    {
                        action: '',
                        value: 0,
                    },
                );

                // act 2
                await store.dispatch(setValue({ value: 15 }));

                // assert 2
                expect(spy).toBeCalledTimes(2);
                expect(spy).toBeCalledWith(
                    {
                        action: 'setValue',
                        value: 15,
                    },
                    {
                        action: 'setValue',
                        value: 5,
                    },
                );
            });
            test('should throw error then store meets to different atoms with one key', () => {
                function atomFactory() {
                    return declareAtom('test')({});
                }
                const store = createStore();

                const atom1 = atomFactory();
                const atom2 = atomFactory();

                // act
                store.subscribe(atom1, () => null);
                expect(() => store.subscribe(atom2, () => null)).toThrow(
                    'Conflict: two different atom can not have same key "test"',
                );
            });
        });
        describe.skip('for action', () => void 0);
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
            expect(store.getState(atom, ({ value }) => value)).toEqual(0);
        });
    });
    describe('dispatch', () => {
        test('builtIn action with payload', async () => {
            const store = createStore();

            const cb: () => void = jest.fn();
            atom.a.setText;
            store.subscribe(atom.a.setText, cb);

            await store.dispatch(atom.a.setText('123'));

            expect(cb).toBeCalledTimes(1);
            expect(cb).toBeCalledWith('123');

            // types
            // @ts-expect-error error because invalid type
            store.dispatch(atom.a.setText(123));
            // @ts-expect-error error because invalid type
            store.dispatch(atom.a.setText());
        });
        test('builtIn action without payload', async () => {
            const store = createStore();

            const cb: () => void = jest.fn();
            store.subscribe(atom.a.inc, cb);

            await store.dispatch(atom.a.inc());

            expect(cb).toBeCalledTimes(1);
            expect(cb).toBeCalledWith(undefined);

            // types
            // @ts-expect-error error because invalid type
            store.dispatch(atom.a.inc(123));
            // @ts-expect-error error because invalid type
            store.dispatch(atom.a.inc('123'));
        });
    });
    describe('sequence', () => {
        let events: string[] = [];
        let store: Store = null as any;

        const actionFooMarker = declareAction(['foo marker']);

        const actionFoo = declareEffect(['foo'], async ({ dispatch }) => {
            events.push('reaction for "foo"');
            await wait();
            return dispatch(actionFooMarker());
        });

        const atomFoo = declareAtom(
            'atomFoo',
            0,
        )((on) =>
            on(actionFoo, (state) => {
                events.push('reducer for "foo"');
                return state + 1;
            }),
        );

        beforeEach(() => {
            events = [];

            store = createStore({}, { trace: false });

            store.debugAPI.onStateChanged((_, action) => events.push('state changed by action "' + action.type + '"'));
            store.subscribe((action) => events.push(`dispatch subscription: action "${action.type}"`));
            store.subscribe(atomFoo, () => events.push('atom subscription: "foo"'));
            store.subscribe(actionFoo, () => events.push('action subscription: "foo"'));
            store.subscribe(actionFooMarker, () => events.push('action subscription: "foo marker"'));
        });

        test('single dispatch', () => {
            return new Promise<void>((resolve) => {
                // act
                store.dispatch(actionFoo()).then(() => {
                    // assert
                    expect(events).toEqual([
                        'reducer for "foo"',
                        'state changed by action "foo"',
                        'reaction for "foo"',
                        'dispatch subscription: action "foo"',
                        'atom subscription: "foo"',
                        'action subscription: "foo"',
                        'after sync dispatch "foo"',
                        'state changed by action "foo marker"',
                        'dispatch subscription: action "foo marker"',
                        'action subscription: "foo marker"',
                    ]);
                    resolve();
                });

                events.push('after sync dispatch "foo"');
            });
        });
        test('dispatch "foo" in effect "bar"', () => {
            return new Promise<void>((resolve) => {
                // arrange
                const actionImmediate = declareAction(['immediate']);

                const atomImmediate = declareAtom(['immediate'], 0)((on) => on(actionImmediate, (state) => state + 1));

                const actionBar = declareEffect(['bar'], ({ dispatch }) => {
                    events.push('reaction for "bar"');
                    dispatch(actionFoo());
                    events.push('after sync dispatch "foo"');
                });

                const atomBar = declareAtom(
                    'bar',
                    0,
                )((on) =>
                    on(actionBar, (state) => {
                        events.push('reducer for "bar"');
                        return state + 1;
                    }),
                );

                store.subscribe(actionFoo, () => store.dispatch(actionImmediate()));
                store.subscribe(actionBar, () => events.push('action subscription: "bar"'));
                store.subscribe(atomBar, () => events.push('atom subscription: "bar"'));
                store.subscribe(atomImmediate, () => events.push('atom subscription: "immediate"'));
                // act

                Promise.resolve().then(() => events.push('--microtask--'));
                setTimeout(() => events.push('--macrotask--'));

                store
                    .dispatch(actionBar())
                    .then(() => delay(1))
                    .then(() => delay())
                    .then(() => {
                        // assert
                        expect(events).toEqual([
                            /* + . . */ 'reducer for "bar"',
                            /* | . . */ 'state changed by action "bar"',
                            /* | . . */ 'reaction for "bar"',
                            /* . + . */ 'reducer for "foo"',
                            /* . | . */ 'state changed by action "foo"',
                            /* . | . */ 'reaction for "foo"',
                            /* . | . */ 'dispatch subscription: action "foo"',
                            /* . | . */ 'atom subscription: "bar"',
                            /* . | . */ 'atom subscription: "foo"',
                            /* . | + */ 'action subscription: "foo"',
                            /* . . | */ 'state changed by action "immediate"',
                            /* . . | */ 'dispatch subscription: action "immediate"',
                            /* . . | */ 'atom subscription: "immediate"',
                            /* . | . */ 'after sync dispatch "foo"',
                            /* | . . */ 'dispatch subscription: action "bar"',
                            /* | . . */ 'action subscription: "bar"',
                            /* | . . */ 'after sync dispatch "bar"',
                            /* . . . */ '--microtask--',
                            /* . . | */ 'state changed by action "foo marker"',
                            /* . . | */ 'dispatch subscription: action "foo marker"',
                            /* . . | */ 'action subscription: "foo marker"',
                            /* . . . */ '--macrotask--',
                        ]);
                        resolve();
                    });

                events.push('after sync dispatch "bar"');
            });
        });
        test('sync dispatch in reaction', () => {
            return new Promise<void>((resolve) => {
                // arrange
                const actionBar = declareEffect(['bar'], ({ dispatch }) => {
                    events.push('reaction for "bar"');
                    dispatch(actionFoo());
                    events.push('after sync dispatch "foo"');
                });

                const atomBar = declareAtom(
                    'bar',
                    0,
                )((on) =>
                    on(actionBar, (state) => {
                        events.push('reducer for "bar"');
                        return state + 1;
                    }),
                );

                store.subscribe(actionBar, () => events.push('action subscription: "bar"'));
                store.subscribe(atomBar, () => events.push('atom subscription: "bar"'));

                // act
                Promise.resolve().then(() => events.push('--microtask--'));
                setTimeout(() => events.push('--macrotask--'));

                store
                    .dispatch(actionBar())
                    .then(wait)
                    .then(() => delay())
                    .then(() => {
                        // assert
                        expect(events).toEqual([
                            /* + . . */ 'reducer for "bar"',
                            /* | . . */ 'state changed by action "bar"',
                            /* | . . */ 'reaction for "bar"',
                            /* . + . */ 'reducer for "foo"',
                            /* . | . */ 'state changed by action "foo"',
                            /* . | + */ 'reaction for "foo"',
                            /* . | * */ 'dispatch subscription: action "foo"',
                            /* . | * */ 'atom subscription: "bar"',
                            /* . | * */ 'atom subscription: "foo"',
                            /* . | * */ 'action subscription: "foo"',
                            /* . | * */ 'after sync dispatch "foo"',
                            /* | . * */ 'dispatch subscription: action "bar"',
                            /* | . * */ 'action subscription: "bar"',
                            /* | . * */ 'after sync dispatch "bar"',
                            /* . . * */ '--microtask--',
                            /* . . | */ 'state changed by action "foo marker"',
                            /* . . | */ 'dispatch subscription: action "foo marker"',
                            /* . . | */ 'action subscription: "foo marker"',
                            /* . . . */ '--macrotask--',
                        ]);
                        resolve();
                    });

                events.push('after sync dispatch "bar"');
            });
        });

        describe.skip('error in reactions', () => void 0);
        describe.skip('error in subscribers', () => void 0);
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
            store.dispatch(atom.a.setText('5'));

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
            store.dispatch(atom.a.setText('55'));

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
        test("delete atom's data after unsubscribe", () => {
            // arrange
            const store = createStore();
            const subscription = store.subscribe(relatedAtom, () => null);

            store.dispatch(atom.a.setText('12'));
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

            store.dispatch(atom.a.setText('10'));
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
            const anotherRelatedAtom = declareAtom<{ value: number }>('anotherRelatedAtom', { value: 0 })((on) =>
                on(atom, (_, { value }) => ({
                    value,
                })),
            );
            const store = createStore();
            store.onGarbageCollected(() => gcEvents++);
            const subscription = store.subscribe(relatedAtom, () => null);
            const subscription2 = store.subscribe(anotherRelatedAtom, () => null);

            store.dispatch(atom.a.setText('5'));
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
            store.subscribe(atom, (state) => (value = state));
            await store.dispatch(atom.a.setText('10'));

            // assert
            expect(value).toEqual({ value: 10, action: 'setText' });
        });

        // todo: атом не удаляется если есть зависимые атомы
        // todo: проверить что удаляются ненужные атомы после удаления родительского

        test('subscribe for actions', async () => {
            // arrange
            const store = createStore();
            let value: any;

            // act
            store.subscribe(setValue, (payload) => (value = payload));
            await store.dispatch(setValue({ value: 10 }));

            // assert
            expect(value).toEqual({ value: 10 });
        });
        test('unsubscribe', async () => {
            // arrange
            const store = createStore();
            let value: any;
            const subscription = store.subscribe(setValue, (payload) => (value = payload));
            await store.dispatch(setValue({ value: 10 }));

            // act
            subscription.unsubscribe();

            // assert
            await store.dispatch(setValue({ value: 10 }));
            expect(value).toEqual({ value: 10 });
        });
        test('error in atom', () => {
            const atom = declareAtom(
                'some',
                {},
            )((on) =>
                on(setValue, () => {
                    throw new Error('Some error');
                }),
            );

            const store = createStore();
            store.subscribe(atom, () => null);

            expect(() => store.dispatch(setValue({ value: 5 }))).toThrow(`Some error`);
        });
    });
});

// TODO check atoms without initialState
// TODO subscribe for action by string type
