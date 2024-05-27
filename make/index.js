/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomError } from 'ts-custom-error';
const base = {};
const load = {};
const fill = {};
const code = {};
let timeHook = (time) => String(time);
class Kink extends CustomError {
    form;
    host;
    code;
    note;
    link;
    siteCode;
    take;
    time;
    static base = (host, form, hook) => {
        base[`${host}:${form}`] = hook;
        return Kink;
    };
    static code = (host, hook) => {
        code[host] = hook;
        return Kink;
    };
    static load = (host, form, hook) => {
        load[`${host}:${form}`] = hook;
        return Kink;
    };
    static fill = (host, form, hook) => {
        fill[`${host}:${form}`] = hook;
        return Kink;
    };
    static make = (host, form, take) => {
        const time = timeHook(Date.now());
        const hook = base[`${host}:${form}`];
        if (!hook) {
            throw new Error(`Missing ${host}:${form} in Kink.base`);
        }
        const hookLink = hook(take);
        const kink = new Kink({
            ...hookLink,
            code: Kink.makeCode(host, hookLink.code),
            form,
            host,
            take: take,
            time,
        });
        Kink.saveLoad(kink, take);
        return kink;
    };
    static saveLoad = (kink, take) => {
        const hook = load[`${kink.host}:${kink.form}`];
        if (!hook) {
            // throw new Error(`Missing ${kink.host}:${kink.form} in Kink.load`)
            return;
        }
        kink.link = hook(take);
    };
    static saveFill = (kink) => {
        const hook = fill[`${kink.host}:${kink.form}`];
        if (!hook) {
            // throw new Error(`Missing ${kink.host}:${kink.form} in Kink.fill`)
            return;
        }
        kink.link = hook(kink.take, kink.link);
    };
    static makeCode = (host, codeLink) => {
        const hook = code[host];
        if (!hook) {
            return codeLink.toString();
        }
        return hook(codeLink);
    };
    static makeBase = (kink, { siteCode, list = false, } = {}) => {
        const time = timeHook(Date.now());
        return new Kink({
            code: 'code' in kink
                ? typeof kink.code === 'string'
                    ? kink.code
                    : typeof kink.code === 'number'
                        ? Kink.makeCode('system', kink.code)
                        : '0000'
                : '0000',
            form: 'system_error',
            host: 'system',
            // list: stack ? kink.stack?.split('\n') ?? [] : [],
            note: kink.message,
            siteCode,
            time,
        });
    };
    constructor({ siteCode, host, note, form, take, link = {}, code, time, }) {
        super(note);
        Object.defineProperty(this, 'name', {
            enumerable: false,
            value: '',
            writable: true,
        });
        Object.defineProperty(this, 'take', {
            enumerable: false,
            value: take,
            writable: true,
        });
        this.time = time;
        this.host = host;
        this.form = form;
        this.code = code;
        this.note = note;
        this.link = link;
        this.take = take;
        this.siteCode = siteCode;
    }
    toJSON() {
        return {
            code: this.code,
            form: this.form,
            host: this.host,
            link: this.link,
            note: this.note,
            time: this.time,
        };
    }
}
export default Kink;
// eslint-disable-next-line sort-exports/sort-exports
export class KinkList extends Kink {
    list;
    constructor(list) {
        const time = timeHook(Date.now());
        super({
            code: Kink.makeCode('@termsurf/kink', 0),
            form: 'list',
            host: '@termsurf/kink',
            note: 'A set of errors occurred.',
            time,
        });
        this.list = list;
    }
}
//# sourceMappingURL=index.js.map