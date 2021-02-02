import { declareAtom } from '../../src';

export interface IProject {
    id: number;
    name: string;
}

export interface IProjectsState {
    list: Map<number, IProject>;
}

export const ProjectsAtom = declareAtom<IProjectsState>(
    'projects',
    {
        list: new Map<number, IProject>([
            [1, {id: 1, name: 'First project'}],
            [2, {id: 2, name: 'Second project'}],
        ]),
    },
    on => [],
);
