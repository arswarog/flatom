import { declareAtom, declareAction } from '../../src';
import { ParentAtom } from './parent.atom';

export interface IChildState {
    num: number;
    str: string;
}

export const setNum = declareAction<{ value: number }>('set num');

export const ChildAtom = declareAtom<IChildState>(
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
    ],
);
