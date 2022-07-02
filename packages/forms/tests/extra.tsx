import { createStore, map, declareAction, declareAtom } from '@flatom/core';

describe('extra atom', () => {
    const setStartAndEnd = declareAction<{ start: number; end: number }>('set start&end');
    const setFoo = declareAction<string>('set foo');
    const setBar = declareAction<string>('set bar');
    const targetFoo = declareAtom<{ foo: string; start: number }>('foo', {
        foo: '',
        start: 0,
    })((on) => [
        on(setStartAndEnd, (state, { start }) => ({
            ...state,
            start,
        })),
        on(setFoo, (state, foo) => ({ ...state, foo })),
    ]);
    const targetBar = declareAtom<{ bar: string; end: number }>('bar', {
        bar: '',
        end: 0,
    })((on) => [
        on(setStartAndEnd, (state, { end }) => ({
            ...state,
            end,
        })),
        on(setBar, (state, bar) => ({ ...state, bar })),
    ]);

    describe('map', () => {
        test('start value', () => {
            const store = createStore();
            const atom = map(targetFoo, (state) => ({
                foo: state.foo,
                num: state.start,
            }));

            store.subscribe(atom, () => null);

            expect(store.getState(atom)).toEqual({
                foo: '',
                num: 0,
            });
        });
        test('update value', () => {
            const store = createStore();
            const atom = map(targetFoo, (state) => ({
                foo: state.foo,
                num: state.start,
            }));

            store.subscribe(atom, () => null);

            expect(store.getState(atom)).toEqual({
                foo: '',
                num: 0,
            });

            store.dispatch(setStartAndEnd({ start: 1, end: 2 }));

            expect(store.getState(atom)).toEqual({
                foo: '',
                num: 1,
            });
        });
        test('update value, but value not changed', () => {
            const store = createStore();
            const atom = map(targetFoo, (state) => ({
                foo: state.foo,
                num: state.start,
            }));

            store.subscribe(atom, () => null);

            expect(store.getState(atom)).toEqual({
                foo: '',
                num: 0,
            });

            store.dispatch(setStartAndEnd({ start: 0, end: 0 }));

            expect(store.getState(atom)).toEqual({
                foo: '',
                num: 0,
            });
        });
    });

    describe('map (with deps)', () => {
        test('type checking', () => {
            // @ts-expect-error result must be an object
            map(targetFoo, (state) => state.foo, [(state) => state.foo]);
        });
        test('check caching value', async () => {
            // arrange
            const updates: any[] = [];

            const store = createStore();
            const atom = map(targetFoo, (state) => ({ foo: state.foo, num: state.start }), [
                (state) => state.foo,
                (state) => state.start,
            ]);

            store.subscribe(atom, (state) => updates.push(state));
            expect(updates.length).toEqual(0);

            // act 1
            await store.dispatch(setFoo('valueX'));
            expect(updates.length).toEqual(1);
            expect(store.getState(atom)).toHaveProperty('foo', 'valueX');

            // act 2
            await store.dispatch(setFoo('valueX'));
            expect(updates.length).toEqual(1);
            expect(store.getState(atom)).toHaveProperty('foo', 'valueX');

            // act 3
            await store.dispatch(setFoo('valueY'));
            expect(updates.length).toEqual(2);
            expect(store.getState(atom)).toHaveProperty('foo', 'valueY');
        });
    });
});

// todo увидеть, какие атомы обновляются если они меняются на идентичные ({x}) => ({x})
