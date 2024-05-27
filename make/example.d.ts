import Kink from './index.js';
type Base = {
    syntax_error: {
        take: {
            foo: string;
        };
    };
};
type Name = keyof Base;
export default function kink<N extends Name>(form: N, take?: Base[N]['take']): Kink;
export {};
