export default class Socket {
    private static _url: string = 'ws://localhost';

    static connection(url: string) {
        this._url = url;
    }

    protected static create(protocol: string) {
        const ws = new WebSocket(this._url, protocol);

        ws.onerror = (error) => {
          console.log('WebSocket error:', error);
        };

        return ws;
    }
}
