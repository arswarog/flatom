import { declareAtom, declareAction } from '../../src';
import { IProject, ProjectsAtom } from './projects.atom';

export interface ICurrentProjectState {
    num: number;
    type?: string;
    payload?: any;
}

export const setChildNum = declareAction<{ value: number }>('set child num');
export const incrementChildNum = declareAction('increment child num');
export const chooseProject = declareAction(
    'choose project',
    [ProjectsAtom],
    ({id}: { id: number }, projects) => {
        return projects.list.get(id)!;
    },
);

export const CurrentProjectAtom = declareAtom<ICurrentProjectState>(
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
        on(chooseProject, (state, project) => {
            return {
                ...state,
                num: project.id,
                type: project.name,
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
