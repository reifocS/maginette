import { Datum } from "@/types";

type Props = {
  deck: Datum[];
  draw: () => void;
  onShuffle: () => void;
  onReset: () => void;
  desengageAll: () => void;
};

export default function Controls({
  deck,
  draw,
  onReset,
  onShuffle,
  desengageAll,
}: Props) {
  return (
    <div className="flex gap-3">
      <button disabled={deck.length === 0} onClick={draw}>
        draw ({deck.length} left)
      </button>
      <button onClick={onShuffle}>Shuffle</button>
      <button onClick={onReset}>Reset</button>
      <button onClick={desengageAll}>Desengage all</button>
    </div>
  );
}
