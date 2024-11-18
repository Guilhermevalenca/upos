import type TAddObject from "./types/TAddObject";
import {Server, Socket} from "socket.io";
import CacheSystem from "./CacheSystem";

export default class UpdatePartialObject {
    private io: Server;
    private map: CacheSystem;

    constructor(io: Server, cacheSystem: CacheSystem) {
        this.io = io;
        this.map = cacheSystem;
    }

    createInstances(socket: Socket) {
        socket.on('add-object', (data: TAddObject) => {
            const eventName: string = `update-${data.id}-${data.name}-`;
            let obj: any;

            if(!this.map.has(`${data.id}-${data.name}`)) {
                this.map.set(`${data.id}-${data.name}`, data.obj);
                obj = {
                    ...data.obj,
                    last_update_at: undefined
                };
            } else {
                obj = this.map.get(`${data.id}-${data.name}`);
                socket.emit(`current-obj-${data.id}-${data.name}`, {
                    ...obj,
                    last_update_at: undefined,
                });
            }

            Object.keys(obj).forEach((key: string) => {
                if(typeof obj[key] !== "object") {
                    this.updateObjectOnSocket(socket, eventName + key, data, key);
                }
            });
        });
    }

    private updateObjectOnSocket(socket: Socket, eventName: string, data: TAddObject, value: string) {
        socket.on(eventName, (setValue: any) => {
            const currentObj = this.map.get(`${data.id}-${data.name}`);

            if(value in currentObj) {
                currentObj[value] = setValue;
                this.io.emit(eventName, setValue);
            }
        });
    }
}