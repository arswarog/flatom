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
        test('other action', () => {
            // arrange
            const setNumEx = declareAction<{ value: number }>('set num ex');
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
                    on.other((state, {type, payload}) => {
                        return {
                            str
                            num: value,
                        };
                    }),
                ],
            );
            const initialState: IChildState = {
                num: 0,
                str: '',
            };

            // act
            const state = AnotherChildAtom(initialState, setNumEx({value: 100}));

            // assert
            expect(state).toEqual({
                num: 100,
                str: '',
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
