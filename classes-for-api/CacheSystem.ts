export default class CacheSystem {
    private readonly limit: number;
    private cache: Map<string, any>;

    constructor(limit: number) {
        this.limit = limit;
        this.cache = new Map();
    }

    get(key: string) {
        if(!this.cache.has(key)) {
            return null;
        }
        const value = this.cache.get(key);

        this.cache.delete(key);
        this.cache.set(key, value);

        return value;
    }

    set(key: string, value: any) {
        if(this.cache.has(key)) {
            this.cache.delete(key);
        }
        if(this.cache.size >= this.limit) {
            const oldKey = this.cache.keys().next().value;
            this.cache.delete(oldKey);
        }

        this.cache.set(key, value);
    }

    delete(key: string) {
        return this.cache.delete(key);
    }

    has(key: string) {
        return this.cache.has(key);
    }
}