import { declareProvider } from '../../src';

export const Timestamp = declareProvider('timespamp', () => {
    return new Date().getTime();
});

export const Random = declareProvider('random', () => {
    return Math.random().toString(16).substring(2);
});
