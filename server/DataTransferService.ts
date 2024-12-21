import type WebSocket from 'ws';
import Marshaller from "./Marshaller";

export default class DataTransferService {
    static on(ws: WebSocket, action: (data: any) => void) {
        ws.on('message', (data: string) => {
            action(Marshaller.deserialize(data));
        });
    }
    static emit<T extends object>(ws: WebSocket, data: T) {
        ws.send(Marshaller.serialize(data));
    }
}