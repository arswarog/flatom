import { Store } from '@flatom/core';

import { AbstractControl, AbstractControlProps } from './abstract-control';
import { FieldAgent } from './field-agent';
import { FieldControl } from './field-control';
import { FormControlSchema } from './form-schema';
import { GroupControl } from './group-control';

export class FormControl<TValue = any> extends GroupControl<TValue> {
    public readonly id: string;

    constructor(schema: FormControlSchema<TValue>, store: Store, props: AbstractControlProps) {
        super(null, schema.id, store, props, schema);

        this.id = schema.id;
        this.root = this;
    }

    init() {
        this._init();
    }

    destroy() {
        this._destroy();
    }

    getControl<T = any>(path: string | (string | number)[]): AbstractControl<T> {
        if (typeof path === 'string') {
            path = path.split('.');
        }

        if (!path[0]) {
            path = path.slice(1);
        }

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let control: AbstractControl = this;

        for (const key of path) {
            control = control.get(key.toString());
        }

        return control;
    }

    getFieldAgent<T = any>(path: string | (string | number)[]): FieldAgent<T> {
        const control = this.getControl(path);

        if (control instanceof FieldControl) {
            return control.agent;
        } else {
            throw new Error(`Control at ${typeof path === 'string' ? path : path.join('.')} is not FieldControl`);
        }
    }
}
