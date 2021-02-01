import { ChildAtom, IChildState, setNum } from './data/child.atom';
import { declareAction, declareAtom } from '../src';
import { ParentAtom, setStr } from './data/parent.atom';

describe('Atom', () => {
    describe('properties', () => {
        test('atomName', () => {
            const atom = declareAtom('test id', {}, on => []);
            expect(atom.atomName).toBe('test id');
        });
        test('symbol as atom\'s id', () => {
            const name = Symbol();
            const atom = declareAtom(name, {}, on => []);
            expect(atom.atomName).toBe(name);
        });
    });
    describe('reducer functionality', () => {
        test('atom', () => {
            const initialState: IChildState = {
                num: 0,
                str: '',
            };

            const state = ParentAtom(initialState, {atom: ChildAtom, state: {num: 10}} as any);

            expect(state).toEqual({
                num: 10,
                str: '',
            });
        });
        test('action', () => {
            const initialState: IChildState = {
                num: 0,
                str: '',
            };

            const state = ChildAtom(initialState, setNum({value: 10}));

            expect(state).toEqual({
                num: 10,
                str: '',
            });
        });
        test('unknown action and state by default', () => {
            const AnotherChildAtom = declareAtom<IChildState>(
                'test',
                {
                    num: 0,
                    str: 'test',
                },
                on => [],
            );

            const state = AnotherChildAtom(undefined, setNum({value: 10}));

            expect(state).toEqual({
                num: 0,
                str: 'test',
            });
        });
        describe('on.other', () => {
            const someAction = declareAction('some action');
            const AnotherChildAtom = declareAtom<IChildState>(
                'test',
                {
                    num: 0,
                    str: 'test',
                },
                on => [
                    on(setNum, (state, {value}) => {
                        return {
                            ...state,
                            num: value,
                        };
                    }),
                    on.other((state, {type}) => {
                        return {
                            str: type,
                            num: state.num + 1,
                        };
                    }),
                ],
            );

            test('known action', () => {
                const initialState: IChildState = {
                    num: 0,
                    str: '',
                };

                const state = AnotherChildAtom(initialState, setNum({value: 10}));

                expect(state).toEqual({
                    num: 10,
                    str: '',
                });
            });
            test('other action', () => {
                // arrange

                // act
                const state = AnotherChildAtom(undefined, someAction({})); // fixme

                // assert
                expect(state).toEqual({
                    num: 1,
                    str: 'some action',
                });
            });
        });
        test('invalid action', () => {
            const initialState: IChildState = {
                num: 0,
                str: '',
            };

            expect(() => ChildAtom(initialState, {} as any)).toThrow();
        });
    });
});
