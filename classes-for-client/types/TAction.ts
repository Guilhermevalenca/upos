type TAction<T> = (data: {
  id: number,
  name: string,
  key: string,
  value: any,
  instance: T,
}) => void;

export default TAction;
