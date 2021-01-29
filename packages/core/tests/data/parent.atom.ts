import { declareAtom, declareAction } from '../../src';
import { ChildAtom } from './child.atom';

export interface IParentState {
    num: number;
    str: string;
}

export const setStr = declareAction('set string', ({value}: { value: string }) => {
    return {
        validationResult: value.length > 5,
        value: value + ' + 1',
    };
});

export const ParentAtom = declareAtom<IParentState>(
    'test',
    {
        num: 0,
        str: 'test',
    },
    on => [
        on(ChildAtom, (state, childState) => {
            return {
                ...state,
                num: childState.num,
            };
        }),
        on(setStr, (state, params) => {
            return {
                ...state,
                str: params.value,
            };
        }),
    ],
);
