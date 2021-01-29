import { StateProvider } from '../../src/provider';

export class HttpClient {
    get() {
        return 'get';
    }

    post() {
        return 'post';
    }
}

export function httpClientFactory(): StateProvider<HttpClient> {
    const httpClient = new HttpClient();
    return {
        getState: () => httpClient,
    };
}
