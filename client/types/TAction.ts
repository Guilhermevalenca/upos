import type TDataBoot from "./TDataBoot.ts";

//@ts-ignore
type TActionDefault<T> = TDataBoot<T> & {
    key: string;
    value: any;
}

type TAction<T> = (data: TActionDefault<T>) => void | Promise<void>;

//@ts-ignore
export default TAction;
