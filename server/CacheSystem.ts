export default class CacheSystem {
    private map: Map<string, any>;
    private readonly maxMemoryBytes: number;
    private currentMemoryBytes: number;

    constructor(maxMemoryMb: number) {
        this.map = new Map();
        this.maxMemoryBytes = maxMemoryMb * 1024 * 1024; //convertendo para bytes
        this.currentMemoryBytes = 0;
    }

    private estimateSize(obj: object) {
        const objectString = JSON.stringify(obj);
        return new Blob([objectString]).size;
    }

    set(key: string, value: object) {
        value['last_update_at'] = new Date();

        const valueSize = this.estimateSize(value);

        // Liberando espaço caso necessário
        while (this.currentMemoryBytes + valueSize > this.maxMemoryBytes) {
            this.deleteLeastRecentlyAdded();
        }

        this.map.set(key, value);
        this.currentMemoryBytes += valueSize;
    }

    get(key: string) {
        if (!this.map.has(key)) return undefined;

        const value = this.map.get(key);
        value.last_update_at = new Date();

        return value;
    }

    delete(key: string) {
        if (this.map.has(key)) {
            const valueSize = this.estimateSize(this.map.get(key));
            this.currentMemoryBytes -= valueSize;
            this.map.delete(key);
        }
    }

    has(key: string) {
        return this.map.has(key);
    }

    private deleteLeastRecentlyAdded() {
        const objects = Array.from(this.map.entries());

        const oldObject = objects.reduce( (oldObj, currentObj) => {
            // console.log(currentObj, oldObj);
            return currentObj[1].last_update_at < oldObj[1].last_update_at ? currentObj : oldObj;
        });

        this.delete(oldObject[0]);
    }

    getCurrentMemoryUsage() {
        return this.currentMemoryBytes;
    }
}
