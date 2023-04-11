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
    <>
      <div className="flex gap-3 flex-wrap items-center p-2">
        <button
          className={buttonClassname}
          disabled={deck.length === 0}
          onClick={draw}
        >
          Draw ({deck.length} left)
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
          Reset positions
        </button>

        <div className="flex items-center gap-2">
          P1
          <input
            className="w-[60px] px-1"
            type={"number"}
            onChange={(e) => mutatePlayerOneLife(+e.target.value)}
            value={playerOneLife}
          ></input>
          pv /
        </div>
        <div className="flex items-center gap-2">
          P2
          <input
            className="w-[60px] px-1"
            type={"number"}
            onChange={(e) => mutatePlayerTwoLife(+e.target.value)}
            value={playerTwoLife}
          ></input>
          pv
        </div>

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
            className="px-3"
            required
            placeholder="card name"
          ></input>
          <button title="find in deck" className={buttonClassname}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </button>
        </form>

        <button
          className={buttonClassname}
          title="undo"
          disabled={!canUndo}
          onClick={undo}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
            />
          </svg>
        </button>
        <button
          className={buttonClassname}
          title="redo"
          disabled={!canRedo}
          onClick={redo}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"
            />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-2 justify-center w-full">
        <div className="font-bold shortcut_container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
            />
          </svg>
          with
          <kbd className="font-normal">ctrl</kbd>
          and view actions with <kbd className="font-normal">left click</kbd>
        </div>
      </div>
    </>
  );
}
