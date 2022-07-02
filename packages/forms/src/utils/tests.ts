export const tick = () => Promise.resolve();
export const timeout = (time = 0) => new Promise((resolve) => setTimeout(resolve, time));
export const setMicrotask = (cb: () => any) => Promise.resolve().then(cb);
