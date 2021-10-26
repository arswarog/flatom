import { declareAtom } from '../src/declare-atom';
import { declareAction, isActionCreator } from '../src/declare-action';

describe('Atom', () => {
    describe('properties', () => {
        test('atomName is a string', () => {
            const atom = declareAtom('test id', {})({});
            expect(atom.key).toBe('test id');
        });
        test('atomName is an array of string', () => {
            const atom = declareAtom(['test', 'id'], {})({});
            expect(atom.key).toBe('test/id');
        });
        test('atomName is an array of string and numbers', () => {
            const atom = declareAtom(['test', 5], {})({});
            expect(atom.key).toBe('test/5');
        });
        test('deny to empty atomName', () => {
            expect(() => declareAtom('', {})({}))
                .toThrow(`AtomName cannot be empty`);
        });
        test('deny to empty array atomName', () => {
            expect(() => declareAtom([], {})({}))
                .toThrow(`AtomName cannot be empty`);
        });
        test('builtIn action is correct action', () => {
            const atom = declareAtom('test id', {})({
                setValue(state, _: number) {return state;},
            });
            expect(isActionCreator(atom.a.setValue)).toBe(true);
        });
    });
    describe('reducer functionality', () => {
        const setValue = declareAction<{ value: number }>('setValue');
        const atom = declareAtom('atom', {
            value: 0,
            action: '',
        })(on => [
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
        })(on => [
            on(atom, (state, {value}) => ({
                action: 'atom',
                value: value.toString(),
            })),
            on.other((state, action) => ({
                value: state.value,
                action: action.type,
            })),
        ]);

        test('atom', () => {
            const state = relatedAtom(undefined, {type: atom, payload: {value: 10, action: ''}} as any);

            expect(state).toEqual({
                value: '10',
                action: 'atom',
            });
        });
        test('action', () => {
            const state = atom(undefined, setValue({value: 10}));

            expect(state).toEqual({
                value: 10,
                action: 'setValue',
            });
        });
        test('built in action', () => {
            const state = atom(undefined, atom.a.setText('20'));

            expect(state).toEqual({
                value: 20,
                action: 'setText',
            });
        });
        test('unknown action and state by default', () => {
            // act
            const state = atom(undefined, {type: 'unknown action'});

            expect(state).toEqual({
                value: 0,
                action: '',
            });
        });
        test('invalid action', () => {
            // assert
            const state = atom(undefined, {} as any);

            expect(state).toEqual({
                value: 0,
                action: '',
            });
        });
        test('discard duplicate target atoms', () => {
            expect(() => declareAtom(
                'test')(
                on => [
                    on(atom, state => state),
                    on(atom, state => state),
                ],
            )).toThrow('Reaction for atom "atom" already set');
        });
        test('discard duplicate target actions', () => {
            expect(() => declareAtom(
                'test',
            )(on => [
                on(setValue, state => state),
                on(setValue, state => state),
            ])).toThrow('Reaction for action "setValue" already set');
        });
        test('discard invalid target', () => {
            expect(() => declareAtom(
                'test',
            )(
                on => [
                    on(null as any, state => state),
                ],
            )).toThrow('Invalid target');
        });
        test('discard invalid reducer', () => {
            expect(() => declareAtom(
                'test',
            )(
                on => [
                    on(setValue, null as any),
                ],
            )).toThrow('Invalid reducer for target "setValue"');
        });
        test('discard duplicate register other', () => {
            expect(() => declareAtom(
                'test',
            )(
                on => [
                    on.other(state => state),
                    on.other(state => state),
                ],
            )).toThrow('on.other already set');
        });
        describe('on.other', () => {
            // arrange
            const someAction = declareAction('some action');

            test('other action', () => {
                // arrange

                // act
                const state = relatedAtom(undefined, someAction());

                // assert
                expect(state).toEqual({
                    value: '',
                    action: 'some action',
                });
            });
        });
    });
});
