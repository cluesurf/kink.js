import { CustomError } from 'ts-custom-error';
export type BaseHook<T extends any = any> = (take?: T) => KinkMeshBase & Link;
export type FillHook<T extends any = any, U extends any = any> = (take?: T, load?: U) => Link;
export type KinkMesh = {
    code: string;
    form: string;
    host: string;
    link?: Link;
    note: string;
    siteCode?: number;
    take?: Link;
    time: string;
};
export type KinkMeshBase = {
    code: number;
    note: string;
};
export type Link = Record<string, unknown>;
export type LoadHook<T extends any = any> = (take?: T) => Link;
export default class Kink extends CustomError {
    form: string;
    host: string;
    code: string;
    note: string;
    link: Link;
    siteCode?: number;
    take?: Link;
    time: string;
    static base: (host: string, form: string, hook: BaseHook) => typeof Kink;
    static code: (host: string, hook: (code: number) => string) => typeof Kink;
    static load: (host: string, form: string, hook: LoadHook) => typeof Kink;
    static fill: (host: string, form: string, hook: FillHook) => typeof Kink;
    static make: (host: string, form: string, take?: any) => Kink;
    static saveLoad: (kink: Kink, take?: any) => void;
    static saveFill: (kink: Kink) => void;
    static makeCode: (host: string, codeLink: number) => string;
    static makeBase: (kink: Error, { siteCode, list, }?: {
        list?: boolean | undefined;
        siteCode?: number | undefined;
    }) => Kink;
    constructor({ siteCode, host, note, form, take, link, code, time, }: KinkMesh);
    toJSON(): KinkMesh;
}
export type TimeHook = (time: number) => string;
export declare class KinkList extends Kink {
    list: Array<Kink>;
    constructor(list: Array<Kink>);
}
