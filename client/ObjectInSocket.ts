import SocketInstance from './SocketInstance';
import type TAction from './types/TAction';

export default class ObjectInSocket {
  static async boot<T extends object>(
    data: {
      id: number,
      name: string,
      instance: T
    },
    actions?: {
      get?: TAction<T> | undefined,
      set?: TAction<T> | undefined,
    } | undefined,
  ): Promise<T> {
    await this.setObjInSocket<T>(data.id, data.name, data.instance, actions?.get);
    return this.createProxyObject<T>(data.id, data.name, data.instance, actions?.set);
  }

  private static async createProxyObject<T extends object>(
    id: number,
    name: string,
    instance: T,
    set?: TAction<T> | undefined,
  ): Promise<T> {
    const socket = SocketInstance.instance();

    return new Proxy(instance, {
      set(_, property, value) {
        const eventName = `update-${id}-${name}-${String(property)}`;
        socket.emit(eventName, value);
        if(set) {
          set({
            id,
            name,
            key: String(property),
            value,
            instance,
          });
        }
        // Reflect.set(target, property, value);
        return true;
      },
      get(_,property) {
        if(property in instance) {
          //@ts-ignore
          return instance[String(property)];
        }
        return undefined;
      }
    });
  }

  private static async setObjInSocket<T extends object>(
    id: number,
    name: string,
    instance: T,
    get?: TAction<T> | undefined,
  ) {
    const socket = SocketInstance.instance();

    socket.on(`current-obj-${id}-${name}`, (value: any) => {
      Object.assign(instance, value);
    });

    socket.emit('add-object', {
      id,
      name,
      obj: instance,
    });

    Object.keys(instance).forEach((key: string) => {
      //@ts-ignore
      if(typeof instance[key] !== "object") {
        socket.on(`update-${id}-${name}-${key}`, (setValue: any) => {
          //@ts-ignore
          instance[key] = setValue;
          if(get) {
            get({
              id,
              name,
              key,
              value: setValue,
              instance,
            });
          }
        });
      }
    });
  }
}
