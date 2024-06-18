export * from "./db"
export * from "./wow"
export * from "./alerts"

export function debounce(func: Function) {
    let timer: number;
    return (...args : any[]) => {
        clearTimeout(timer);
        timer = window.setTimeout(() => { func.apply(this, args); }, 250);
    };
}