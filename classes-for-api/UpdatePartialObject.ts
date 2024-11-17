import type TAddObject from "./types/TAddObject";
import {Server, Socket} from "socket.io";
import CacheSystem from "./CacheSystem";

export default class UpdatePartialObject {
    private socket: Socket;
    private io: Server;
    private map: CacheSystem;

    constructor(io: Server, cacheSystem: CacheSystem) {
        this.io = io;
        this.map = cacheSystem;
    }

    startedInstances(socket: Socket) {
        this.socket = socket;

        this.createInstances();
    }

    private createInstances() {
        this.socket.on('add-object', (data: TAddObject) => {
            const eventName: string = `update-${data.id}-${data.name}-`;
            let obj: any;

            if(!this.map.has(`${data.id}-${data.name}`)) {
                this.map.set(`${data.id}-${data.name}`, data.obj);
                obj = data.obj;
            } else {
                obj = this.map.get(`${data.id}-${data.name}`);
                this.socket.emit(`current-obj-${data.id}-${data.name}`, obj);
            }

            Object.keys(obj).forEach((key: string) => {
                this.updateObjectOnSocket(eventName + key, data, key);
            });
        });
    }

    private updateObjectOnSocket(eventName: string, data: TAddObject, value: string) {
        this.socket.on(eventName, (setValue: any) => {
            const currentObj = this.map.get(`${data.id}-${data.name}`);
            this.map.set(`${data.id}-${data.name}`, {
                ...currentObj,
                [value]: setValue,
            });

            this.io.emit(eventName, setValue);
        });
    }
}