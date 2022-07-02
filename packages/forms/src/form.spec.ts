import { createStore, Store } from '@flatom/core';

import { tick, timeout } from './utils/tests';

import { FormControlStatus, GroupControlState } from './abstract-control-state';
import { FormControl } from './form-control';
import { declareFormSchema } from './form-schema';
import { GroupControl } from './group-control';
import { ReadonlyControl } from './readonly-control';
import { createValidatorsLibrary, ValidatorsLibrary } from './validation';
import { validators } from './validation/standard-validators';

describe('Forms', () => {
    interface FormValue {
        name: string;
        profile: {
            age: number;
        };
        address: {
            city: string;
            street: string;
            house?: number;
        };
        agreement: boolean;
    }

    const schema = declareFormSchema<FormValue>({
        id: 'add-tx',
        updateOn: 'change',
        nullable: true,
        controls: {
            name: {
                nullable: true,
            },
            profile: {
                nullable: true,
                controls: {
                    age: {
                        nullable: true,
                        validators: [validators.required(), validators.min(18)],
                    },
                },
            },
            address: {
                nullable: true,
                controls: {
                    city: {
                        nullable: true,
                        defaultValue: 'City 17',
                    },
                    street: {
                        nullable: true,
                    },
                    house: {
                        nullable: true,
                    },
                },
            },
            agreement: {
                defaultValue: false,
            },
        },
    });

    let store: Store;
    let library: ValidatorsLibrary;
    let form: FormControl;

    beforeEach(() => {
        store = createStore();
        library = createValidatorsLibrary([], {
            required: 'required',
            children: 'children',
        });
        form = new FormControl<FormValue>(schema, store, { library });

        form.init();
    });

    describe('values', () => {
        it.skip('defaultValue', () => {
            expect(form.value).toEqual({
                name: null,
                profile: {
                    age: null,
                },
                address: {
                    city: 'City 17',
                    house: null,
                    street: null,
                },
                agreement: false,
            });
        });

        it.skip('group get changes from field', () => {
            // arrange
            const spyFormFn = jest.fn();
            const spyProfileFn = jest.fn();
            const spyAgeFn = jest.fn();

            const age = form.getControl('profile.age');
            const ageAgent = form.getFieldAgent('profile.age');
            const profile = form.getControl('profile') as GroupControl<FormValue['profile']>;

            form.onStateChange(spyFormFn);
            profile.onStateChange(spyProfileFn);
            age.onStateChange(spyAgeFn);

            expect(form.value).toEqual({
                name: null,
                profile: {
                    age: null,
                },
                address: {
                    city: 'City 17',
                    house: null,
                    street: null,
                },
                agreement: false,
            });

            // act
            ageAgent.handleChange(18);

            // assert
            expect(spyFormFn.mock.calls.length).toBe(1);
            expect(spyFormFn.mock.calls[0][0]).toBeInstanceOf(ReadonlyControl);
            expect(spyFormFn.mock.calls[0][0].value).toEqual({
                name: null,
                profile: {
                    age: 18,
                },
                address: {
                    city: 'City 17',
                    house: null,
                    street: null,
                },
                agreement: false,
            });

            expect(spyProfileFn.mock.calls.length).toBe(1);
            expect(spyProfileFn.mock.calls[0][0]).toBeInstanceOf(ReadonlyControl);
            expect(spyProfileFn.mock.calls[0][0].value).toEqual({
                age: 18,
            });

            expect(spyAgeFn.mock.calls.length).toBe(1);
            expect(spyAgeFn.mock.calls[0][0]).toBeInstanceOf(ReadonlyControl);
            expect(spyAgeFn.mock.calls[0][0].value).toEqual(18);
        });

        it.skip('set nullable child value', () => {
            const city = form.getControl('address.city');
            const cityAgent = form.getFieldAgent('address.city');

            expect(cityAgent).toBeTruthy();
            expect(city.path).toEqual('add-tx.address.city');

            cityAgent.handleChange('City 17');

            expect(city.value).toEqual('City 17');
            expect(form.value).toEqual({
                name: null,
                profile: {
                    age: null,
                },
                address: {
                    city: 'City 17',
                    house: null,
                    street: null,
                },
                agreement: false,
            });
        });

        it.skip('set some value to group control', async () => {
            // act
            const address = form.getControl('address') as GroupControl<FormValue['address']>;

            expect(address.path).toEqual('add-tx.address');

            address.setValue({
                city: 'City 18',
                street: 'Nevskaya',
            });

            // assert
            expect(address.get('city').value).toEqual('City 18');
            expect(address.get('street').value).toEqual('Nevskaya');
            expect(address.get('house').value).toEqual(null);
            expect(address.value).toEqual({
                city: 'City 18',
                street: 'Nevskaya',
                house: null,
            });

            expect(form.value).toEqual({
                name: null,
                profile: {
                    age: null,
                },
                address: {
                    city: 'City 18',
                    street: 'Nevskaya',
                    house: null,
                },
                agreement: false,
            });

            await timeout();
        });

        it.skip('set null value to nullable group control', () => {
            const spyFormFn = jest.fn();
            const address = form.getControl('address') as GroupControl<FormValue['address']>;
            const spyAddressFn = jest.fn();

            form.onStateChange(spyFormFn);
            address.onStateChange(spyAddressFn);

            // arrange
            const cityAgent = form.getFieldAgent('address.city');

            cityAgent.handleChange('City 19');

            // act
            expect(address.path).toEqual('.address');

            address.setValue(null);

            // assert

            expect(address.get('city').value).toEqual(null);
            expect(address.get('street').value).toEqual(null);
            expect(address.get('house').value).toEqual(null);

            expect(address.value).toEqual(null);
            expect(form.value).toEqual({
                name: null,
                profile: {
                    age: null,
                },
                address: null,
                agreement: false,
            });

            expect(spyFormFn.mock.calls.length).toBe(2);
            expect(spyFormFn.mock.calls[0][0]).toBeInstanceOf(FormControl);
            expect(spyFormFn.mock.calls[0][1]).toEqual({
                // fixme
                // dirty: true,
                value: {
                    name: null,
                    profile: {
                        age: null,
                    },
                    address: {
                        city: 'City 19',
                        street: null,
                        house: null,
                    },
                    agreement: false,
                },
                controls: {
                    address: {
                        // fixme
                        // dirty: true,
                        value: {
                            city: 'City 19',
                            street: null,
                            house: null,
                        },
                        controls: {
                            city: {
                                dirty: true,
                                value: 'City 19',
                            },
                        },
                    },
                },
            });
            expect(spyFormFn.mock.calls[1][0]).toBeInstanceOf(FormControl);
            expect(spyFormFn.mock.calls[1][1]).toEqual({
                // fixme
                // dirty: true,
                value: {
                    name: null,
                    profile: {
                        age: null,
                    },
                    address: null,
                    agreement: false,
                },
                controls: {
                    address: {
                        // fixme
                        // dirty: true,
                        value: null,
                    },
                },
            });

            expect(spyAddressFn.mock.calls.length).toBe(2);
            expect(spyAddressFn.mock.calls[0][0]).toBeInstanceOf(GroupControl);
            expect(spyAddressFn.mock.calls[0][1]).toEqual({
                // fixme
                // dirty: true,
                value: {
                    city: 'City 19',
                    street: null,
                    house: null,
                },
                controls: {
                    city: {
                        dirty: true,
                        value: 'City 19',
                    },
                },
            });
            expect(spyAddressFn.mock.calls[1][0]).toBeInstanceOf(GroupControl);
            expect(spyAddressFn.mock.calls[1][1]).toEqual({
                // fixme
                // dirty: true,
                value: null,
            });
        });

        // check for no emit if state not changed
    });

    describe('validation', () => {
        it('group get changes from field', async () => {
            const schema = declareFormSchema({
                id: 'test',
                updateOn: 'change',
                nullable: true,
                controls: {
                    age: {
                        nullable: true,
                        validators: [validators.required(), validators.min(18)],
                    },
                },
            });

            form = new FormControl(schema, store, { library });
            form.init();

            // arrange
            const spyFormFn = jest.fn();
            const spyAgeFn = jest.fn();

            const age = form.getControl('age');
            const ageAgent = form.getFieldAgent('age');

            form.onStateChange(spyFormFn);
            age.onStateChange(spyAgeFn);

            expect(age.status).toEqual(FormControlStatus.Invalid);
            expect(age.errors).toEqual({ required: {} });
            expect(form.status).toEqual(FormControlStatus.Invalid);
            expect(form.errors).toEqual({ children: { list: ['age'] } });

            // act
            ageAgent.handleChange(21);

            // assert 1
            expect(spyAgeFn.mock.calls.length).toBe(1);
            expect(spyAgeFn.mock.calls[0][0].status).toBe(FormControlStatus.Pending);
            expect(spyAgeFn.mock.calls[0][0].dirty).toBeTruthy();
            expect(spyAgeFn.mock.calls[0][0].errors).toBeNull();

            expect(spyFormFn.mock.calls.length).toBe(1);
            expect(spyFormFn.mock.calls[0][0].status).toBe(FormControlStatus.Pending);
            expect(spyFormFn.mock.calls[0][0].errors).toBeNull();

            await timeout();

            // assert 2
            expect(spyAgeFn.mock.calls.length).toBe(2);
            expect(spyAgeFn.mock.calls[1][0].status).toBe(FormControlStatus.Valid);
            expect(spyAgeFn.mock.calls[1][0].dirty).toBeTruthy();
            expect(spyAgeFn.mock.calls[1][0].errors).toBeNull();

            expect(spyFormFn.mock.calls.length).toBe(3);
            expect(spyFormFn.mock.calls[2][0].status).toBe(FormControlStatus.Valid);
            expect(spyFormFn.mock.calls[2][0].errors).toBeNull();
        });
    });
});
