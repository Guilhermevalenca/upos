type TDataBoot<T> = {
    id: string | number;
    typeName?: string;
    instance: T;
}

export default TDataBoot;