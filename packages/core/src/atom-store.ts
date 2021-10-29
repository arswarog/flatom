import { Atom } from './atom.types';

type SubAtomKey = string;

export class AtomToken<T = any> {
    public readonly stateKey: string;

    constructor(public readonly atom: Atom<T>, public readonly key?: SubAtomKey) {
        if (atom)
            if (typeof atom.key === 'symbol') this.stateKey = atom.key;
            else this.stateKey = atom.key + (key ? '/' + key : '');
        else this.stateKey = '';
    }

    public toString() {
        if (!this.atom) return '∅';
        if (this.key) return this.atom.key + '⊃' + this.key;
        else return this.atom.key;
    }
}

export class AtomStore {
    private staticAtoms = new Map<Atom<any>, AtomToken>();
    private subAtoms = new Map<Atom<any>, Map<SubAtomKey, AtomToken>>();

    public readonly special: AtomToken;

    constructor() {
        this.special = new AtomToken(null as any);
        this.staticAtoms.set(null as any, this.special);
    }

    public get<TState>(atom: Atom<TState>, id?: string | null): AtomToken<TState> {
        if (id) {
            if (typeof atom.key === 'symbol') throw new Error('Atom with symbol as a key can not be meta atom');
            let subAtoms = this.subAtoms.get(atom);
            if (!subAtoms) {
                subAtoms = new Map<SubAtomKey, AtomToken>();
                this.subAtoms.set(atom, subAtoms);
            }
            let token = subAtoms.get(id);
            if (!token) {
                token = new AtomToken(atom, id);
                subAtoms.set(id, token);
            }
            return token;
        } else {
            let token = this.staticAtoms.get(atom);
            if (!token) {
                token = new AtomToken(atom);
                this.staticAtoms.set(atom, token);
            }
            return token;
        }
    }

    // todo: remove token
}
