import { Action, Store } from '@flatom/core';
import { EnhancerOptions } from 'redux-devtools-extension';

interface DevTools {
    connect(options: EnhancerOptions): any;
}

function getReduxDevtoolExtensionIfExists(): DevTools {
    return typeof window !== 'undefined' && window['__REDUX_DEVTOOLS_EXTENSION__']
        ? window['__REDUX_DEVTOOLS_EXTENSION__']
        : null;
}

export function connectReduxDevtools(store: Store) {
    const devToolsExtension = getReduxDevtoolExtensionIfExists();

    if (!devToolsExtension) {
        return;
    }

    const devTools = devToolsExtension.connect({
        serialize: true,
        features: {
            pause: false,
            lock: true,
            persist: true,
            export: true,
            import: 'custom',
            jump: true,
            skip: false,
            reorder: false,
            dispatch: false,
            test: false,
        },
    });

    devTools.init(store.getState());

    store.subscribe((action: Action) => {
        const state = store.getState();

        if (action.type !== '@@JUMP_TO_STATE') {
            devTools.send(action, state);
        }
    });

    store.onGarbageCollected(() => {
        devTools.send({ type: '@@GARBAGE_COLLECTION' }, store.getState());
    });

    const dispatchTypes = {
        COMMIT: () => devTools.init(store.getState()),
        REORDER_ACTION: dispatchNotAllowed,
        PAUSE_RECORDING: dispatchNotAllowed,
        RESET: dispatchNotAllowed,
        ROLLBACK: dispatchNotAllowed,
        JUMP_TO_ACTION: dispatchNotAllowed,
        TOGGLE_ACTION: dispatchNotAllowed,
    };

    const eventTypes = {
        START: () => null,
        ACTION: onAction,
        DISPATCH: (event) => (dispatchTypes[event.payload.type] || dispatchNotAllowed)(event),
    };

    devTools.subscribe(console.log);
    devTools.subscribe((event: any) => eventTypes[event.type]?.(event));

    function dispatchNotAllowed(event) {
        devTools.error(`Not allow dispatch ${event.payload.type}`);
    }

    function onAction(event: any) {
        try {
            const action = JSON.parse(event.payload);

            store.dispatch(action);
        } catch (_) {
            devTools.error('Failed to decode action, may be action is not valid JSON');
        }
    }
}
