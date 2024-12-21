import Marshaller from "./Marshaller";

export default class DataTransferService {
  static on(
    ws: WebSocket,
    action: (data: any) => void
  ) {
    ws.onmessage = (event: MessageEvent) => {
      action(Marshaller.deserialize(event.data));
    };
  }
  static emit<T extends object>(ws: WebSocket, data: T) {
    ws.send(Marshaller.serialize(data));
  }
}
