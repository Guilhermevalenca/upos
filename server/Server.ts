import WebSocket, {type ServerOptions, WebSocketServer} from 'ws';
import {type IncomingMessage} from 'node:http';
import CacheSystem from "./CacheSystem";
import type TUpdatedData from "./types/TUpdatedData";
import DataTransferService from "./DataTransferService";

export default class Server {
    private _cacheSystem: CacheSystem;

    constructor(
        memoryLimit: number = 1000,
        private readonly update?: (data: TUpdatedData) => void | Promise<void>,
    ) {
        this._cacheSystem = new CacheSystem(memoryLimit);
    }

    boot(
        options?: ServerOptions<typeof WebSocket.WebSocket, typeof IncomingMessage>,
        callback?: () => void
    ): WebSocket.Server<typeof WebSocket, typeof IncomingMessage> {
        const webSocketServer = new WebSocketServer(options, callback);

        webSocketServer.on('connection', (ws: WebSocket) => {
            this.onMessage(webSocketServer, ws);
        });

        return webSocketServer;
    }

    private onMessage(
        webSocketServer:  WebSocket.Server<typeof WebSocket, typeof IncomingMessage>,
        ws: WebSocket,
    ) {
        DataTransferService.on(ws, (data: any) => {

            if('add_object' in data && 'data' in data) {
                delete data.add_object;
                this.createInstance(ws, data);

            } else if('key' in data && 'value' in data) {
                const instance = this._cacheSystem.get(ws.protocol);
                instance[data.key] = data.value;

                if(this.update) {
                    const [id, typeName] = ws.protocol.split('-');
                    this.update({
                        ...data,
                        instance,
                        id,
                        typeName,
                    });
                }
                this.sendAllClient(webSocketServer, ws, data);
            }
        });
    }

    private createInstance(
        ws: WebSocket,
        value: {
            data: {
                instance: any,
            }
        },
    ) {
        if(!this._cacheSystem.has(ws.protocol)) {
            this._cacheSystem.set(ws.protocol, value.data?.instance);
        } else {
            const obj = this._cacheSystem.get(ws.protocol);

            DataTransferService.emit(ws, {
                setObject: {
                    ...obj,
                    last_update_at: undefined,
                }
            });
        }
    }

    private sendAllClient(
        webSocketServer:  WebSocket.Server<typeof WebSocket, typeof IncomingMessage>,
        ws: WebSocket,
        data: {
            key: string,
            value: any,
        },
    ) {
        webSocketServer.clients.forEach((client) => {
            if(client.protocol === ws.protocol) {
                DataTransferService.emit(client, {
                    key: data.key,
                    value: data.value,
                });
            }
        });
    }
}
