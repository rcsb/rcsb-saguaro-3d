
export class DataContainer<T> {
    private data: T | undefined = undefined;

    constructor(data?:T) {
        this.data = data;
    }

    public get(): T | undefined{
        return this.data
    }
    public set(data: T | undefined): void{
        this.data = data;
    }
}