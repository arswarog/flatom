import { createStore, declareAction } from '../src';
import { chooseProject, CurrentProjectAtom } from './data/currentProject.atom';
import { ParentAtom } from './data/parent.atom';

describe('ActionCreator', () => {
    test('simple action', () => {
        const setNum = declareAction<{ value: number }>('set num');

        expect(setNum.type).toBe('set num');
        expect(setNum({value: 10})).toEqual({
            type: 'set num',
            payload: {
                value: 10,
            },
        });
    });

    describe('prepare actions', () => {
        test('modifier', () => {
            const setNum = declareAction(
                'set num',
                ({val}: { val: number }) => ({value: val * 2}),
            );

            const action = setNum({val: 10});
            expect(setNum.type).toBe('set num');
            expect(action).toEqual({
                type: 'set num',
                payload: {
                    value: 20,
                },
                params: {
                    val: 10,
                },
            });
        });
    });

    describe('providers', () => {
        test('atom', () => {
            // arrange
            const store = createStore();

            const action = chooseProject({id: 1}, store);
            expect(chooseProject.type).toBe('choose project');
            expect(action).toEqual({
                type: 'choose project',
                payload: {
                    id: 1,
                    name: 'First project',
                },
                params: {
                    id: 1,
                },
            });
        });
    });
});
