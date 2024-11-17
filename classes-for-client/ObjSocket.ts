import { io, type Socket } from 'socket.io-client';

export default class ObjSocket {
  private readonly _socket: Socket;
  private static instance: ObjSocket | null = null;
  private static _url: string = '';

  private constructor(url: string) {
    this._socket = io(url);
  }

  static socketInstance(): Socket {
    if(this.instance === null) {
      this.instance = new ObjSocket(this._url);
    }
    return this.instance.socket;
  }

  static createSocketInstance(url: string) {
    this._url = url;
    if(this.instance === null) {
      this.instance = new ObjSocket(url);
    }
    return this.instance.socket;
  }

  get socket() {
    return this._socket;
  }

  static async newObjInSocket<T extends object>(id: number, name: string, instance: T): Promise<T> {
    const proxyObject = await this.createProxyObject<T>(id, name, instance);
    await this.setObjInSocket<T>(id, name, instance);

    return proxyObject;
  }

  private static async createProxyObject<T extends object>(id: number, name: string, instance: T): T {
    const socket = this.socketInstance();

    return new Proxy(instance, {
      set(_, property, value) {
        const eventName = `update-${id}-${name}-${String(property)}`;
        socket.emit(eventName, value);
        // Reflect.set(target, property, value);
        return true;
      },
      get(_,property) {
        if(property in instance) {
          return instance[property];
        }
        return undefined;
      }
    });
  }

  private static async setObjInSocket<T extends object>(id: number, name: string, instance: T) {
    const socket = this.socketInstance();

    this.socketInstance().on(`current-obj-${id}-${name}`, (value: any) => {
      Object.assign(instance, value);
    });

    socket.emit('add-object', {
      id,
      name,
      obj: instance,
    });

    Object.keys(instance).forEach((key: string) => {
      socket.on(`update-${id}-${name}-${key}`, (setValue: any) => {
        instance[key] = setValue;
      });
    });
  }
}
