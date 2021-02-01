import { createStore } from '../../src';
import { setParentStr } from './parent.atom';
import { ChildAtom } from './child.atom';
import { ServiceStore } from '../../src';
import { HttpClient, httpClientFactory } from './http.provider';

export function parentServiceFactory({subscribe}: ServiceStore, httpClient: HttpClient) {
    subscribe(setParentStr, [ChildAtom], (payload, child) => {
        console.log(payload.value);
        console.log(child);
    });

    return () => {
        console.log('end');
    };
}

const store = createStore();
store.runService([httpClientFactory()], parentServiceFactory);
