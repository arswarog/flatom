import { Atom } from './atom.types';
import { PayloadActionCreator, Reaction } from './action.types';
import { isAtom } from './declare-atom';
import { declareAction } from './declare-action';

export function declareActions<T extends { [key: string]: unknown }>(
    namespace: string | Atom<any>,
    creator: (generators: { action<R>(): Reaction<R, unknown> }) => { [key in keyof T]: Reaction<T[key], unknown> },
): { [key in keyof T]: PayloadActionCreator<T[key], unknown> } {
    const result: Record<string, PayloadActionCreator<any, unknown>> = {};

    if (isAtom(namespace)) {
        namespace = namespace.key;
    }

    function action<R>(): Reaction<R, unknown> {
        return null as any;
    }

    const actions = creator({ action });

    Object.keys(actions).forEach((key) => (result[key] = declareAction<any>(namespace + ':' + key)));

    return result as any;
}
