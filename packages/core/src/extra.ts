import { Atom } from './atom.types';
import { declareAtom } from './declareAtom';

const memoStorage = Symbol('memo');

export function map<Target, Result>(
    target: Atom<Target>,
    mapper: (state: Target) => Result,
): Atom<Result> ;
export function map<Target, Result extends object>(
    target: Atom<Target>,
    mapper: (state: Target) => Result,
    deps: Array<(state: Target) => any>,
): Atom<Result> ;
export function map<Target, Result>(
    target: Atom<Target>,
    mapper: (state: Target) => Result,
    deps?: Array<(state: Target) => any>,
): Atom<Result> {
    if (!deps)
        return declareAtom<Result>(
            Symbol('map atom') as any,
            undefined,
            on => on(target, (_, value) => mapper(value)),
        );

    const atom = declareAtom<Result & { [memoStorage]: Target }>(
        Symbol('memoMap atom') as any,
        undefined,
        on => on(target, (oldState, value) => {
            if (oldState && deps.every(
                (selector, index) => oldState[memoStorage][index] === selector(value),
            ))
                return oldState;
            const result = mapper(value);
            result[memoStorage] = deps.map(selector => selector(value));
            return result as any;
        }),
    );
    return atom as any;
}

export function combine<Target, Result>(
    target: Atom<Target>,
    mapper: (state: Target) => Result,
): Atom<Result> {
    const atom = declareAtom<Result>(
        '',
        undefined,
        on => on(target, (_, value) => mapper(value)),
    );
    return atom;
}
