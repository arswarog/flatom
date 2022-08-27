import { useStore } from '@flatom/react';
import { useContext } from 'react';
import { FieldControl } from '@flatom/forms';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { FlatomFormContext } from './context';

export function useField<TValue = any>(field: string) {
    const store = useStore();
    const context = useContext(FlatomFormContext);
    const control = context.getControl(field) as FieldControl<TValue>;

    return useSyncExternalStore(
        (cb) =>
            store.subscribe(control.atom, () => {
                cb();
            }),
        () => control.agent,
    );
}
