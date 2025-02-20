import type TDataBoot from "./types/TDataBoot.ts";
import type TAction from "./types/TAction.ts";
import Socket from "./Socket.ts";
import DataTransferService from './DataTransferService.ts';

export default class SetObject extends Socket {
    static async boot<T extends object>(
        data: TDataBoot<T>,
        action?: {
            get?: TAction<T>,
            set?: TAction<T>,
        },
    ) {
        const ws: WebSocket = this.create(data.id + '-' + (data.typeName ?? typeof data.instance));

        await this.send_object_for_to_server(data, ws, action?.get);

        ws.onopen = () => {
          DataTransferService.emit(ws, {
            data: {
              instance: data.instance,
            },
            add_object: true,
          });
        }

        return this.createProxy(data, ws, action?.set);
    }

    private static async send_object_for_to_server<T extends object>(
        data: TDataBoot<T>,
        ws: WebSocket,
        get?: TAction<T>
    ) {
        DataTransferService.on(ws,(obj) => {
          if('setObject' in obj) {
            //@ts-ignore
            Object.assign(data.instance, obj.setObject);
          } else if('key' in obj && 'value' in obj) {
            if(String(obj.key) in data.instance || Array.isArray(data.instance)) {
              //@ts-ignore
              data.instance[String(obj.key)] = obj.value;

              if(get) {
                get({
                  ...data,
                  key: obj.key,
                  value: obj.value,
                });
              }
            }
          }
        });
    }

    private static async createProxy<T extends object>(
        data: TDataBoot<T>,
        ws: WebSocket,
        set?: TAction<T>
    ) {
        const debounced = this.debounce((key: string, value: any) => {
            DataTransferService.emit(ws, {
                key,
                value,
            });
            console.log('key', String(key), 'value', value);
        }, 1000);

        return new Proxy(data.instance, {
            set(_, key, value) {

                if(String(key) in data.instance) {
                    debounced(String(key), value);

                    //@ts-ignore
                    data.instance[String(key)] = value;

                    if(set) {
                        set({
                            ...data,
                            key: String(key),
                            value,
                        });
                    }
                }

                return true;
            },
            get(_, key) {
                if(key in data.instance) {
                    //@ts-ignore
                    return data.instance[String(key)];
                }
                return undefined;
            }
        });
    }

    private static debounce<T extends (...args: any[]) => void> (func: T, delay: number) {
        let timeoutId: ReturnType<typeof setTimeout>;

        return (...args: Parameters<T>) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    }
}
