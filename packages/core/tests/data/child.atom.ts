import { declareAtom, declareAction } from '../../src';
import { ParentAtom } from './parent.atom';

export interface IChildState {
    num: number;
    type?: string;
    payload?: any;
}

export const setNum = declareAction<{ value: number }>('set num');
export const incrementNum = declareAction('increment num');

export const ChildAtom = declareAtom<IChildState>(
    'test',
    {
        num: 0,
    },
    on => [
        on(setNum, (state, {value}) => {
            return {
                ...state,
                num: value,
            };
        }),
        on(incrementNum, (state) => {
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
