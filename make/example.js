import Kink from './index.js';
const host = '@termsurf/kink';
Kink.base(host, 'syntax_error', (take) => ({
    code: 1,
    link: take,
    note: 'Syntax error',
}));
Kink.code(host, (code) => code.toString(16).padStart(4, '0'));
export default function kink(form, take) {
    return Kink.make(host, form, take);
}
//# sourceMappingURL=example.js.map