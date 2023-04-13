type ButtonProps = {
  text: string;
};
export default function Button({ text }: ButtonProps) {
  return <button>{text}</button>;
}
