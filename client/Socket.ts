export default class Socket {
    private static _url: string = 'ws://localhost';

    static connection(url: string) {
        this._url = url;
    }

    protected static create(protocol: string) {
        return new WebSocket(Socket._url, protocol);
    }
}