import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'

export default class SocketInstance {
  private static _instance: Socket | null = null;
  static url: string;

  static instance(): Socket {
    if(this._instance === null) {
      this._instance = io(this.url);
    }
    return this._instance;
  }

  static createSocketInstance(url: string) {
    this.url = url;
    return this.instance();
  }

  static resetInstance(url?: string | undefined) {
    if(url) {
      this._instance = io(url);
    } else {
      this._instance = io(this.url);
    }
    return this._instance;
  }
}
