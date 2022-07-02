import { Atom, declareAtom } from '@flatom/core';
import * as sprout from 'sprout-data';

import { AbstractControlState, FormControlStatus, GroupControlState } from '../abstract-control-state';

import { actions } from './actions';
import { combineStatuses } from './utils';

export function groupAtomFactory(
    path: string,
    name: string,
    initialValue: any,
    children: Atom<AbstractControlState>[],
): Atom<GroupControlState> {
    return declareAtom<GroupControlState>('groupControl:' + path, {
        path,
        name,
        value: initialValue,
        status: FormControlStatus.Pending,
        disabled: false,
        focused: false,
        dirty: false,
        touched: false,
        errors: null,
        firstErrorMessage: '',
        validators: [],
        errorMessages: {},
        controls: {},
    })((on) => {
        on(actions.setValue, (state, { path, value }) => {
            if (state.path !== path) {
                return state;
            }

            state = sprout.assoc(state, ['status'], FormControlStatus.Pending);
            state = sprout.assoc(state, ['errors'], null);
            state = sprout.assoc(state, ['value'], value);

            return state;
        });
        on(actions.change, (state, value) => {
            if (state.path !== value.path) {
                return state;
            }

            return state;
        });
        on(actions.valid, (state, { path }) => {
            if (state.path !== path) {
                return state;
            }

            state = sprout.assoc(state, ['status'], FormControlStatus.Valid);
            state = sprout.assoc(state, ['errors'], null);
            state = sprout.assoc(state, ['firstErrorMessage'], '');

            return state;
        });
        on(actions.pending, (state, { path }) => {
            if (state.path !== path) {
                return state;
            }

            state = sprout.assoc(state, ['status'], FormControlStatus.Pending);
            state = sprout.assoc(state, ['errors'], null);
            state = sprout.assoc(state, ['firstErrorMessage'], '');

            return state;
        });
        on(actions.invalid, (state, { path, errors, firstErrorMessage }) => {
            if (state.path !== path) {
                return state;
            }

            state = sprout.assoc(state, ['status'], FormControlStatus.Invalid);
            state = sprout.assoc(state, ['errors'], errors);
            state = sprout.assoc(state, ['firstErrorMessage'], firstErrorMessage);

            return state;
        });
        children.forEach((child) =>
            on(child, (state, childState) => {
                state = sprout.assoc(state, ['controls', childState.name], childState);
                state = sprout.assoc(state, ['value', childState.name], childState.value);

                const status = combineStatuses(Object.values(state.controls).map((item) => item.status));

                if (status !== FormControlStatus.Invalid) {
                    state = sprout.assoc(state, ['errors'], null);
                }

                state = sprout.assoc(state, ['status'], status);

                return state;
            }),
        );
    });
}
