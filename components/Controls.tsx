import {
  useMutation,
  useStorage,
  useCanUndo,
  useCanRedo,
  useUndo,
  useRedo,
} from "@/liveblocks.config";
import { CardFromLiveList, Datum } from "@/types";

type Props = {
  deck: CardFromLiveList;
  draw: () => void;
  onShuffle: () => void;
  onReset: () => void;
  desengageAll: () => void;
  resetPosition: () => void;
  searchCard: (cardName: string) => void;
};

const buttonClassname =
  "inline-flex text-white bg-slate-500 border-0 py-1 px-4 focus:outline-none hover:bg-slate-600 rounded";

export default function Controls({
  deck,
  draw,
  onReset,
  onShuffle,
  desengageAll,
  resetPosition,
  searchCard,
}: Props) {
  const playerOneLife = useStorage((root) => root.playerOne?.life);
  const playerTwoLife = useStorage((root) => root.playerTwo?.life);
  const mutatePlayerOneLife = useMutation(
    ({ storage }, life: number) => storage.get("playerOne")?.set("life", life),
    []
  );
  const mutatePlayerTwoLife = useMutation(
    ({ storage }, life: number) => storage.get("playerTwo")?.set("life", life),
    []
  );
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const undo = useUndo();
  const redo = useRedo();
  return (
    <div className="flex gap-3 flex-wrap items-center p-2">
       <div className="font-normal shortcut_container">
        Zoom with
        <kbd>Ctrl</kbd>
        <kbd>click</kbd>
        </div>
      <button
        className={buttonClassname}
        disabled={deck.length === 0}
        onClick={draw}
      >
        draw ({deck.length} left)
      </button>
      <button
        className={buttonClassname}
        disabled={deck.length === 0}
        onClick={onShuffle}
      >
        Shuffle
      </button>
      <button className={buttonClassname} onClick={desengageAll}>
        Desengage all
      </button>
      <button className={buttonClassname} onClick={resetPosition}>
        Reset all position
      </button>
      <button className={buttonClassname} disabled={!canUndo} onClick={undo}>
        undo
      </button>
      <button className={buttonClassname} disabled={!canRedo} onClick={redo}>
        redo
      </button>
      <form
        className="flex gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          const target = e.target as typeof e.target & {
            card_name: {
              value: string;
            };
          };
          searchCard(target.card_name.value);
        }}
      >
        <input
          id="card_name"
          name="card_name"
          required
          placeholder="card name"
        ></input>
        <button className={buttonClassname}>search in deck</button>
      </form>
      <div className="flex items-center gap-2">
        P1{" "}
        <input
          className="w-[60px]"
          type={"number"}
          onChange={(e) => mutatePlayerOneLife(+e.target.value)}
          value={playerOneLife}
        ></input>
        pv /{" "}
      </div>
      <div className="flex items-center gap-2">
        P2{" "}
        <input
          className="w-[60px]"
          type={"number"}
          onChange={(e) => mutatePlayerTwoLife(+e.target.value)}
          value={playerTwoLife}
        ></input>
        pv
      </div>
    </div>
  );
}
