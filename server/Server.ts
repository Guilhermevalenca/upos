import WebSocket, {type ServerOptions, WebSocketServer} from 'ws';
import {type IncomingMessage} from 'node:http';
import CacheSystem from "./CacheSystem";
import type TUpdatedData from "./types/TUpdatedData";

export default class Server {
    private _cacheSystem: CacheSystem;

    constructor(
        memoryLimit: number = 1000,
        private readonly update?: (data: TUpdatedData) => void
    ) {
        this._cacheSystem = new CacheSystem(memoryLimit);
    }

    boot(
        options?: ServerOptions<typeof WebSocket.WebSocket, typeof IncomingMessage>,
        callback?: () => void
    ): WebSocket.Server<typeof WebSocket, typeof IncomingMessage> {
        const wss = new WebSocketServer(options, callback);

        wss.on('connection', (ws: WebSocket) => {
            ws.on('error', console.error);

            ws.on('message', (data: string) => {
                const translateData = JSON.parse(data);

                if('add_object' in translateData) {
                    delete translateData.add_object;
                    this.createInstance(translateData, ws);
                } else if('key' in translateData && 'value' in translateData) {

                    const instance = this._cacheSystem.get(ws.protocol);
                    instance[translateData.key] = translateData.value;

                    if(this.update) {
                        const [id, typeName] = ws.protocol.split('-');
                        this.update({
                            ...translateData,
                            instance,
                            id,
                            typeName,
                        });
                    }

                    wss.clients.forEach((client) => {
                        if(client.protocol === ws.protocol) {
                            client.send(JSON.stringify({
                                key: translateData.key,
                                value: translateData.value,
                            }));
                        }
                    });
                }
            });
        });
        return wss;
    }

    private createInstance(value: object, ws: WebSocket) {
        if('data' in value) {
            const data: any = value.data;

            if(!this._cacheSystem.has(ws.protocol)) {
                this._cacheSystem.set(ws.protocol, data?.instance);
            } else {
                console.log('testando');
                const obj = this._cacheSystem.get(ws.protocol);
                console.log(obj);
                ws.send(JSON.stringify({
                    setObject: {
                        ...obj,
                        last_update_at: undefined,
                    }
                }));
            }
        }
    }
}