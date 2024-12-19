import type TDataBoot from "./TDataBoot";

type TActionDefault<T> = TDataBoot<T> & {
    key: string;
    value: any;
}

type TAction<T> = (data: TActionDefault<T>) => void | Promise<void>;

export default TAction;