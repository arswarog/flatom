import { declareAtom, declareAction } from '../../src';
import { ParentAtom } from './parent.atom';

export interface IChildState {
    num: number;
    type?: string;
    payload?: any;
}

export const setChildNum = declareAction<{ value: number }>('set child num');
export const incrementChildNum = declareAction('increment child num');

export const ChildAtom = declareAtom<IChildState>(
    'child',
    {
        num: 0,
    },
    on => [
        on(setChildNum, (state, {value}) => {
            return {
                ...state,
                num: value,
            };
        }),
        on(incrementChildNum, (state) => {
            return {
                ...state,
                num: state.num + 1,
            };
        }),
        on.other((state, action) => {
            return {
                ...state,
                type: action.type,
                payload: action.payload,
            };
        }),
    ],
);
