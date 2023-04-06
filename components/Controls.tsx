import {
  useMutation,
  useStorage,
  useCanUndo,
  useCanRedo,
  useUndo,
  useRedo,
} from "@/liveblocks.config";
import { Datum } from "@/types";

type Props = {
  deck: Datum[];
  draw: () => void;
  onShuffle: () => void;
  onReset: () => void;
  desengageAll: () => void;
  resetPosition: () => void;
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
  //   const canUndo = useCanUndo();
  //   const canRedo = useCanRedo();
  //   const undo = useUndo();
  //   const redo = useRedo();
  return (
    <div className="flex gap-3 flex-wrap">
      <button
        className={buttonClassname}
        disabled={deck.length === 0}
        onClick={draw}
      >
        draw ({deck.length} left)
      </button>
      <button className={buttonClassname} onClick={onShuffle}>
        Shuffle
      </button>
      <button className={buttonClassname} onClick={onReset}>
        Reset
      </button>
      <button className={buttonClassname} onClick={desengageAll}>
        Desengage all
      </button>
      <button className={buttonClassname} onClick={resetPosition}>
        Reset all position
      </button>
      {/* <button disabled={!canUndo} onClick={undo}>
        undo
      </button>
      <button disabled={!canRedo} onClick={redo}>
        redo
      </button> */}
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
