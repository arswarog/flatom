import { ReadonlyStore } from './store.types';
import { ActionCreator, AnyAction } from './declareAction';
import { Atom } from './declareAtom';

export interface Store extends ReadonlyStore {
    dispatch(action: AnyAction): Promise<any>;
}

export function createStore(): Store {
    let atoms : Atom<any>[] = [];

    function subscribe(target: Atom<any> | ActionCreator<any>)

    return {

    }
}
