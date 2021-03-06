import { declareAtom, declareAction } from '../../src';
import { CurrentProjectAtom } from './currentProject.atom';

export interface IParentState {
    childNum: number;
    str: string;
}

export const setParentStr = declareAction({
    type: 'set string',
    prepare: ({value}: { value: string }) => ({
        validationResult: value.length > 5,
        value: value + ' + 1',
    }),
});

export const ParentAtom = declareAtom<IParentState>(
    'parent',
    {
        childNum: 0,
        str: 'test',
    },
    on => [
        on(CurrentProjectAtom, (state, childState) => {
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
