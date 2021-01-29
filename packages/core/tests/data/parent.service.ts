import { createStore } from '../../src';
import { setStr } from './parent.atom';
import { ChildAtom } from './child.atom';
import { ServiceStore } from '../../src';
import { HttpClient, httpClientFactory } from './http.provider';

export function parentServiceFactory({subscribe}: ServiceStore, httpClient: HttpClient) {
    subscribe(setStr, [ChildAtom], (payload, child) => {
        console.log(payload.value);
        console.log(child);
    });

    return () => {
        alert('end');
    };
}

const store = createStore();
store.runService([httpClientFactory()], parentServiceFactory);
