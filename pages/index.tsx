import Head from "next/head";
import {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useCards from "@/hooks/useCards";
import { Datum } from "@/types";
import { shuffle } from "@/utils";
import { useGesture } from "@use-gesture/react";
import { useQueryClient } from "@tanstack/react-query";

function processRawText(fromArena: string) {
  if (fromArena.trim() === "") return [];
  return new Set(
    fromArena
      .split("\n")
      .map((s) => s.replace(/^[0-9]+/g, "").trim())
      .filter((s) => s !== "")
  );
}

type PropsCard = {
  card: Datum;
  show: boolean;
  field: Fields;
  sendCardTo(from: Fields, to: Fields, card: Datum, payload?: any): void;
};
type PropsCards = {
  cards: Datum[];
  show: boolean;
  field: Fields;
  sendCardTo(from: Fields, to: Fields, card: Datum, payload?: any): void;
};
function Cards({ cards, show, field, sendCardTo }: PropsCards) {
  return (
    <ul className="flex gap-3 flex-wrap">
      {cards.map((v) => (
        <li key={v.id}>
          <Card card={v} field={field} show={show} sendCardTo={sendCardTo} />
        </li>
      ))}
    </ul>
  );
}

let zIndex = 1;

type ContextMenuProps = {
  x: number;
  y: number;
  onClose: () => void;
  field: Fields;
  onEngaged: () => void;
  onSwapped: () => void;
  sendCardTo(from: Fields, to: Fields, card: Datum, payload?: any): void;
  card: Datum;
};

const CustomContextMenu = ({
  x,
  y,
  onClose,
  field,
  onEngaged,
  onSwapped,
  sendCardTo,
  card,
}: ContextMenuProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const className = "p-1 cursor-pointer hover:bg-slate-500";

  return (
    <div
      className="bg-slate-800 p-3"
      ref={ref}
      style={{
        position: "absolute",
        top: y,
        left: x,
        zIndex: 9999,
      }}
    >
      <ul className="flex flex-col">
        {fields
          .filter((f) => f !== field && f !== "tokens")
          .map((f) => {
            if (f === "deck") {
              return (
                <Fragment key={f}>
                  <li
                    className={className}
                    onClick={() => {
                      sendCardTo(field, f, card, { position: "top" });
                    }}
                  >
                    Send to top of {f}
                  </li>
                  <li
                    className={className}
                    onClick={() => {
                      sendCardTo(field, f, card, { position: "bottom" });
                    }}
                  >
                    Send to bottom of {f}
                  </li>
                </Fragment>
              );
            }
            return (
              <li
                className={className}
                key={f}
                onClick={() => {
                  sendCardTo(field, f, card);
                }}
              >
                Send to {f}
              </li>
            );
          })}
        <li className={className} onClick={onEngaged}>
          Engage/Desengage
        </li>
        <li className={className} onClick={onSwapped}>
          Swap face
        </li>
      </ul>
    </div>
  );
};

type Fields =
  | "battlefield"
  | "graveyard"
  | "exile"
  | "hand"
  | "deck"
  | "tokens";

const fields: Fields[] = [
  "battlefield",
  "graveyard",
  "exile",
  "hand",
  "deck",
  "tokens",
];

type Point = {
  x: number;
  y: number;
};

function Card({ card, show = true, field, sendCardTo }: PropsCard) {
  const [swap, setSwap] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const z = useRef(0);
  const [contextMenuPosition, setContextMenuPosition] = useState<Point | null>(
    null
  );
  const [engage, setEngaged] = useState(false);

  const index = swap ? 1 : 0;
  const bind = useGesture({
    onDragStart: () => {
      z.current = zIndex++;
    },
    onDrag: ({ offset: [x, y] }) => {
      setPosition({ x, y });
    },
    onContextMenu: ({ event }) => {
      if (!show) return;
      event.preventDefault();
      setContextMenuPosition({ x: event.pageX, y: event.pageY });
    },
  });

  const handleContextMenuClose = () => {
    setContextMenuPosition(null);
  };

  let src = card;
  if (card.card_faces) {
    src = card.card_faces![index];
  }
  if (!show) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element*/}
        <img
          alt={src.name}
          className="w-[180px] h-250px]"
          src="https://upload.wikimedia.org/wikipedia/en/thumb/a/aa/Magic_the_gathering-card_back.jpg/200px-Magic_the_gathering-card_back.jpg"
        />
      </>
    );
  }

  const transformStyle = `translate3d(${position.x}px, ${
    position.y
  }px, 0) rotate(${engage ? 90 : 0}deg)`;

  return (
    <>
      <div
        style={{
          transform: transformStyle,
          touchAction: "none",
          zIndex: z.current,
          position: "relative",
        }}
        {...bind()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element*/}
        <img
          draggable={false}
          loading="eager"
          className="w-[180px] h-250px]"
          src={src.image_uris?.normal}
          alt={src.name}
        ></img>
      </div>
      {contextMenuPosition && (
        <CustomContextMenu
          field={field}
          onEngaged={() => setEngaged((prev) => !prev)}
          onSwapped={() => {
            if (card.card_faces) setSwap((prev) => !prev);
          }}
          x={contextMenuPosition.x}
          y={contextMenuPosition.y}
          onClose={handleContextMenuClose}
          sendCardTo={sendCardTo}
          card={card}
        />
      )}
    </>
  );
}

function processCardWithTheirAmount(cards: string) {
  const map = new Map<string, number>();
  for (const card of cards.split("\n")) {
    const [amount, ...cardName] = card.split(" ");
    map.set(cardName.join(" "), +amount);
  }
  return map;
}

export default function Home() {
  const [copyFromArena, setCopyFromArena] = useState("");
  const queryClient = useQueryClient();
  const memoAmount = useMemo(
    () => processCardWithTheirAmount(copyFromArena),
    [copyFromArena]
  );
  const { data, isLoading, fetchStatus, isFetching, refetch } = useCards(
    Array.from(processRawText(copyFromArena))
  );
  const allParts =
    data
      ?.filter((v) => v.all_parts && v.all_parts.length > 0)
      .flatMap((v) => v.all_parts) ?? [];

  const related = useCards(Array.from(new Set(allParts.map((v) => v.name))));

  const [deck, setDeck] = useState<Datum[]>([]);
  const [hand, setHand] = useState<Datum[]>([]);
  const [graveyard, setGraveyard] = useState<Datum[]>([]);
  const [battlefield, setBattlefield] = useState<Datum[]>([]);

  const [exile, setExile] = useState<Datum[]>([]);

  useEffect(() => {
    if (!data) {
      return;
    }
    let d = [];
    for (const card of data) {
      const amountInDeckToAdd = Number(memoAmount.get(card.name));
      for (let i = 0; i < amountInDeckToAdd; ++i) {
        d.push({ ...card, id: card.id + "-" + i });
      }
    }
    setDeck(shuffle(d));

    return () => {
      setHand([]);
      setGraveyard([]);
      setExile([]);
      setDeck([]);
      setBattlefield([]);
    };
  }, [data, memoAmount]);

  function onShuffle() {
    setDeck(shuffle(deck));
  }

  const mappingFieldToState: Record<
    Fields,
    Dispatch<SetStateAction<Datum[]>>
  > = {
    deck: setDeck,
    battlefield: setBattlefield,
    graveyard: setGraveyard,
    hand: setHand,
    exile: setExile,
    tokens: (t) => {
      throw new Error("Trying to change token state");
    },
  };

  function sendCardTo(from: Fields, to: Fields, card: Datum, payload?: any) {
    const fromState = mappingFieldToState[from];
    const toState = mappingFieldToState[to];
    if (to === "deck") {
      if (!payload)
        throw new Error("Payload missing when sending card to deck");
      if (payload.position === "top") {
        setDeck((prev) => [card, ...prev]);
      } else if (payload.position === "bottom") {
        setDeck((prev) => [...prev, card]);
      }
      if (from !== "tokens") {
        fromState((prev) => prev.filter((c) => c.id !== card.id));
      }
      return;
    }
    if (from !== "tokens") {
      fromState((prev) => prev.filter((c) => c.id !== card.id));
    }
    toState((prev) => [...prev, card]);
  }

  function onReset() {
    queryClient.resetQueries();
  }

  function draw() {
    if (deck.length === 0) return;
    setHand((prev) => [...prev, deck[0]]);
    setDeck((prev) => prev.slice(1));
  }

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <form
        className={`${
          copyFromArena.trim() !== ""
            ? "hidden"
            : "flex flex-col grow-0 items-center content-center"
        }`}
        onSubmit={(e) => {
          e.preventDefault();
          const target = e.target as typeof e.target & {
            cards: { value: string };
          };
          setCopyFromArena(target.cards.value);
        }}
      >
        <label htmlFor="cards">Paste deck here</label>
        <textarea
          name="cards"
          id="cards"
          cols={30}
          rows={10}
          defaultValue={`
3 Ambitious Farmhand
4 Reckoner Bankbuster
2 Elspeth Resplendent
2 March of Otherworldly Light
4 The Restoration of Eiganjo
4 Roadside Reliquary
1 Eiganjo, Seat of the Empire
16 Plains
4 Ossification
4 Wedding Announcement
2 Destroy Evil
4 The Wandering Emperor
4 Lay Down Arms
3 The Eternal Wanderer
3 Mirrex

3 Depopulate
2 Fateful Absence
3 Farewell
4 Sunset Revelry
3 Loran of the Third Path`}
        ></textarea>
        <button>Submit</button>
      </form>
      <div className="flex gap-3">
        <div className="border-r-2">
          <div className="flex gap-3">
            <button disabled={deck.length === 0} onClick={draw}>
              draw ({deck.length} left)
            </button>
            <button onClick={onShuffle}>Shuffle</button>
            <button onClick={onReset}>Reset</button>
          </div>

          {isLoading && fetchStatus !== "idle" && (
            <div
              style={{
                borderTopColor: "transparent",
              }}
              className="w-16 h-16 border-4 border-blue-400 border-solid rounded-full animate-spin"
            ></div>
          )}
          <div onClick={draw}>
            {deck[0] && (
              <Card
                card={deck[0]}
                field={"deck"}
                show={false}
                sendCardTo={sendCardTo}
              />
            )}
          </div>
          {/*data && <Cards cards={data} />*/}
          <p className="text-xl font-extrabold">Battlefield</p>
          <Cards
            cards={battlefield}
            show={true}
            field="battlefield"
            sendCardTo={sendCardTo}
          />
          <p className="text-xl font-extrabold">Hand</p>
          <Cards
            cards={hand}
            show={true}
            field="hand"
            sendCardTo={sendCardTo}
          />
          <p className="text-xl font-extrabold">Graveyard</p>
          <Cards
            cards={graveyard}
            show={true}
            field="graveyard"
            sendCardTo={sendCardTo}
          />
          <p className="text-xl font-extrabold">Exile</p>
          <Cards
            cards={exile}
            show={true}
            field="exile"
            sendCardTo={sendCardTo}
          />
          <p className="text-xl font-extrabold">Tokens</p>
          {related.data && (
            <Cards
              cards={related.data}
              show={true}
              field="tokens"
              sendCardTo={sendCardTo}
            />
          )}
        </div>
        <div>
          {/*data && <Cards cards={data} />*/}
          <p className="text-xl font-extrabold">Battlefield</p>
          <Cards
            cards={battlefield}
            show={true}
            field="battlefield"
            sendCardTo={sendCardTo}
          />
          <p className="text-xl font-extrabold">Hand</p>
          <Cards
            cards={hand}
            show={false}
            field="hand"
            sendCardTo={sendCardTo}
          />
          <p className="text-xl font-extrabold">Graveyard</p>
          <Cards
            cards={graveyard}
            show={true}
            field="graveyard"
            sendCardTo={sendCardTo}
          />
          <p className="text-xl font-extrabold">Exile</p>
          <Cards
            cards={exile}
            show={true}
            field="exile"
            sendCardTo={sendCardTo}
          />
          <p className="text-xl font-extrabold">Tokens</p>
          {related.data && (
            <Cards
              cards={related.data}
              show={true}
              field="tokens"
              sendCardTo={sendCardTo}
            />
          )}
        </div>
      </div>
    </>
  );
}
