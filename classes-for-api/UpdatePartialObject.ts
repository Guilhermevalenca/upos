import type TAddObject from "./types/TAddObject";
import type TAction from './types/TAction';
import {Server, Socket} from "socket.io";
import CacheSystem from "./CacheSystem";

export default class UpdatePartialObject {
    private io: Server;
    private map: CacheSystem | Map<string, any>;

    constructor(io: Server, cacheSystem?: CacheSystem) {
        this.io = io;
        if(cacheSystem) {
            this.map = cacheSystem;
        } else {
            this.map = new CacheSystem(1000);
        }
    }

    createInstances(
        socket: Socket,
        action?: TAction | undefined,
    ) {
        socket.on('add-object', (data: TAddObject) => {
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

            const eventName: string = `update-${data.id}-${data.name}-`;
            Object.keys(obj).forEach((key: string) => {
                if(typeof obj[key] !== "object") {
                    this.updateObjectOnSocket(socket, eventName + key, data, key, action);
                }
            });
        });
    }

    private updateObjectOnSocket(socket: Socket, eventName: string, data: TAddObject, key: string, action?: TAction | undefined) {
        socket.on(eventName, (setValue: any) => {
            const currentObj = this.map.get(`${data.id}-${data.name}`);

            if(key in currentObj) {
                currentObj[key] = setValue;
                this.io.emit(eventName, setValue);
                if(action) {
                    action({
                        id: data.id,
                        name: data.name,
                        key: key,
                        value: setValue,
                        instance: currentObj,
                    });
                }
            }
        });
    }
}
