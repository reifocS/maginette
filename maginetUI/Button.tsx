type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  text: string;
};
export default function Button({ text, ...rest }: ButtonProps) {
  return <button {...rest}>{text}</button>;
}
