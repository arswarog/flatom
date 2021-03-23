import { CurrentProjectAtom, setChildNum } from './data/currentProject.atom';
import { declareAction, declareAtom } from '../src';
import { ParentAtom } from './data/parent.atom';

describe('Atom', () => {
    describe('properties', () => {
        test('atomName is a string', () => {
            const atom = declareAtom('test id', {}, _ => []);
            expect(atom.key).toBe('test id');
        });
        test('atomName is an array of string', () => {
            const atom = declareAtom(['test', 'id'], {}, _ => []);
            expect(atom.key).toBe('test/id');
        });
        test('atomName is an array of string and numbers', () => {
            const atom = declareAtom(['test', 5], {}, _ => []);
            expect(atom.key).toBe('test/5');
        });
        test('deny to empty atomName', () => {
            expect(() => declareAtom('', {}, _ => []))
                .toThrow(`AtomName cannot be empty`);
        });
        test('deny to empty array atomName', () => {
            expect(() => declareAtom([], {}, _ => []))
                .toThrow(`AtomName cannot be empty`);
        });
    });
    describe('reducer functionality', () => {
        test('atom', () => {
            const state = ParentAtom(undefined, {type: CurrentProjectAtom, payload: {num: 10}} as any);

            expect(state).toEqual({
                childNum: 10,
                str: 'test',
            });
        });
        test('action', () => {
            const state = CurrentProjectAtom(undefined, setChildNum({value: 10}));

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
            const someAction = declareAction(['some action']);

            test('known action', () => {
                // act
                const state = CurrentProjectAtom(undefined, setChildNum({value: 10}));

                // assert
                expect(state).toEqual({
                    num: 10,
                });
            });
            test('other action', () => {
                // arrange

                // act
                const state = CurrentProjectAtom(undefined, someAction());

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
            const state = CurrentProjectAtom(undefined, {} as any);

            expect(state).toEqual({
                num: 0,
            });
        });
        test('discard duplicate target atoms', () => {
            expect(() => declareAtom(
                'test',
                null,
                on => [
                    on(ParentAtom, state => state),
                    on(ParentAtom, state => state),
                ],
            )).toThrow('Reaction for atom "parent" already set');
        });
        test('discard duplicate target actions', () => {
            expect(() => declareAtom(
                'test',
                null,
                on => [
                    on(setChildNum, state => state),
                    on(setChildNum, state => state),
                ],
            )).toThrow('Reaction for action "set child num" already set');
        });
        test('discard invalid target', () => {
            expect(() => declareAtom(
                'test',
                null,
                on => [
                    on(null as any, state => state),
                ],
            )).toThrow('Invalid target');
        });
        test('discard invalid reducer', () => {
            expect(() => declareAtom(
                'test',
                null,
                on => [
                    on(setChildNum, null as any),
                ],
            )).toThrow('Invalid reducer');
        });
        test('discard duplicate register other', () => {
            expect(() => declareAtom(
                'test',
                null,
                on => [
                    on.other(state => state),
                    on.other(state => state),
                ],
            )).toThrow('on.other already set');
        });
    });
});
