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
};

export default function Controls({
  deck,
  draw,
  onReset,
  onShuffle,
  desengageAll,
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
      <button disabled={deck.length === 0} onClick={draw}>
        draw ({deck.length} left)
      </button>
      <button onClick={onShuffle}>Shuffle</button>
      <button onClick={onReset}>Reset</button>
      <button onClick={desengageAll}>Desengage all</button>
      {/* <button disabled={!canUndo} onClick={undo}>
        undo
      </button>
      <button disabled={!canRedo} onClick={redo}>
        redo
      </button> */}
      <div>
        P1{" "}
        <input
          className="w-[60px]"
          type={"number"}
          onChange={(e) => mutatePlayerOneLife(+e.target.value)}
          value={playerOneLife}
        ></input>
        pv
      </div>
      /
      <div>
        P2{" "}
        <input
          className="w-[60px]"
          type={"number"}
          onChange={(e) => mutatePlayerTwoLife(+e.target.value)}
          value={playerTwoLife}
        ></input>
      </div>
      pv
    </div>
  );
}
