export default class Marshaller {
    static serialize<T extends object>(data: T): string {
        try {
            return JSON.stringify(data);
        } catch (e) {
            throw new Error("Unable to serialize the data. Please ensure it is in a valid format.");
        }
    }
    static deserialize<T extends object>(data: string): T {
        try {
            return JSON.parse(data);
        } catch (e) {
            throw new Error('Unable to deserialize the data. Please ensure it is in a valid format.');
        }
    }
}
