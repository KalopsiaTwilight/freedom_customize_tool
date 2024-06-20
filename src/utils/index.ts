export * from "./db"
export * from "./wow"

export function debounce(func: Function) {
    let timer: number;
    return (...args : any[]) => {
        clearTimeout(timer);
        timer = window.setTimeout(() => { func.apply(this, args); }, 250);
    };
}

export const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))