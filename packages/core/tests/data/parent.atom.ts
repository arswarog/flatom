import { declareAtom, declareAction } from '../../src';
import { ChildAtom } from './child.atom';

export interface IParentState {
    childNum: number;
    str: string;
}

export const setParentStr = declareAction('set string', ({value}: { value: string }) => {
    return {
        validationResult: value.length > 5,
        value: value + ' + 1',
    };
});

export const ParentAtom = declareAtom<IParentState>(
    'parent',
    {
        childNum: 0,
        str: 'test',
    },
    on => [
        on(ChildAtom, (state, childState) => {
            return {
                ...state,
                childNum: childState.num,
            };
        }),
        on(setParentStr, (state, params) => {
            return {
                ...state,
                str: params.value,
            };
        }),
    ],
);
