type TAction = (data: {
    id: number,
    name: string,
    key: string,
    value: any,
    instance: any,
}) => void;

export default TAction;