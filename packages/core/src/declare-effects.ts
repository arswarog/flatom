import { Atom } from './atom.types';
import { PayloadActionCreator, Reaction } from './action.types';
import { isAtom } from './declare-atom';
import { declareEffect } from './declare-action';

export function declareEffects<T extends { [key: string]: unknown }>(
    namespace: string | Atom<any>,
    effects: { [key in keyof T]: Reaction<T[key], unknown> },
): { [key in keyof T]: PayloadActionCreator<T[key], unknown> } {
    const result: Record<string, PayloadActionCreator<any, unknown>> = {};

    if (isAtom(namespace)) {
        namespace = namespace.key;
    }

    Object.keys(effects).forEach((key) => (result[key] = declareEffect(namespace + ':' + key, effects[key])));

    return result as any;
}
