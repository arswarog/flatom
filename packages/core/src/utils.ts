export const delay = (timeout = 0) => new Promise<void>(resolve => setTimeout(resolve, timeout));
export const wait = () => Promise.resolve();
