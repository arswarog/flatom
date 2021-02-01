import { ChildAtom, setChildNum } from './data/child.atom';
import { declareAction, declareAtom } from '../src';
import { ParentAtom } from './data/parent.atom';

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
            const state = ParentAtom(undefined, {atom: ChildAtom, state: {num: 10}} as any);

            expect(state).toEqual({
                childNum: 10,
                str: 'test',
            });
        });
        test('action', () => {
            const state = ChildAtom(undefined, setChildNum({value: 10}));

            expect(state).toEqual({
                num: 10,
            });
        });
        test('unknown action and state by default', () => {
            // act
            const state = ParentAtom(undefined, setChildNum({value: 10}));

            expect(state).toEqual({
                childNum: 0,
                str: 'test',
            });
        });
        describe('on.other', () => {
            // arrange
            const someAction = declareAction('some action');

            test('known action', () => {
                // act
                const state = ChildAtom(undefined, setChildNum({value: 10}));

                // assert
                expect(state).toEqual({
                    num: 10,
                });
            });
            test('other action', () => {
                // arrange

                // act
                const state = ChildAtom(undefined, someAction());

                // assert
                expect(state).toEqual({
                    num: 0,
                    type: 'some action',
                    payload: undefined,
                });
            });
        });
        test('invalid action', () => {
            // assert
            expect(() => ChildAtom(undefined, {} as any)).toThrow();
        });
    });
});
