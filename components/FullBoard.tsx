import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import useCards from "@/hooks/useCards";
import { Datum, Fields } from "@/types";
import { generateRandomID, shuffle } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import Controls from "./Controls";
import PlayerBoard from "./PlayerBoard";
import { useStorage, useMutation } from "@/liveblocks.config";
import { LiveObject, LiveList, LiveMap } from "@liveblocks/client";
import OpponentBoard from "./OpponentBoard";
import { useRouter } from "next/router";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ResizeHandle from "./ResizeHandle";

function processRawText(fromArena: string) {
  if (fromArena.trim() === "") return [];
  return new Set(
    fromArena
      .split("\n")
      .map((s) => s.replace(/^[0-9]+/g, "").trim())
      .filter((s) => s !== "")
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

type Props = {
  player: number;
};

function dataToLiveList(data?: Datum[]) {
  return new LiveList(
    data?.map(
      (d) =>
        new LiveObject({
          id: d.id,
          name: d.name,
          image_uris: new LiveObject({ normal: d.image_uris?.normal }),
          card_faces: new LiveList(
            d.card_faces?.map(
              (cf) =>
                new LiveObject({
                  name: cf.name,
                  id: cf.id,
                  image_uris: new LiveObject({
                    normal: cf.image_uris.normal,
                  }),
                })
            )
          ),
        })
    )
  );
}

function dataToLiveObject(
  hand: Datum[],
  graveyard: Datum[],
  exile: Datum[],
  engaged: string[],
  battlefield: Datum[],
  data?: Datum[],
  related?: Datum[],
  life?: number,
  tokens?: [string, [number, number]][]
) {
  return new LiveObject({
    deck: dataToLiveList(data),
    related: dataToLiveList(related),
    hand: dataToLiveList(hand),
    graveyard: dataToLiveList(graveyard),
    exile: dataToLiveList(exile),
    engaged: new LiveList(engaged),
    battlefield: dataToLiveList(battlefield),
    life: life!,
    tokens: new LiveMap(tokens),
  });
}

export default function FullBoard({ player }: Props) {
  const queryClient = useQueryClient();

  const [deckFromText, setDeckFromText] = useState("");
  const { data, isLoading, fetchStatus, isSuccess } = useCards(
    Array.from(processRawText(deckFromText))
  );

  const playerOne = useStorage((root) => root.playerOne);
  const playerTwo = useStorage((root) => root.playerTwo);

  const otherPlayer = player === 0 ? playerTwo : playerOne;

  const router = useRouter();
  const { room } = router.query;

  const allParts =
    data
      ?.filter((v) => v.all_parts && v.all_parts.length > 0)
      .flatMap((v) => v.all_parts) ?? [];

  const related = useCards(
    Array.from(
      new Set(
        allParts.map((v) => {
          if (v.name.includes("//")) {
            //Double faced card
            return v.name.split("//")[0].trim();
          }
          return v.name;
        })
      )
    )
  );
  const memoAmount = useMemo(
    () => processCardWithTheirAmount(deckFromText),
    [deckFromText]
  );
  const [deck, setDeck] = useState<Datum[]>([]);
  const [hand, setHand] = useState<Datum[]>([]);
  const [graveyard, setGraveyard] = useState<Datum[]>([]);
  const [battlefield, setBattlefield] = useState<Datum[]>([]);
  const [engaged, setEngaged] = useState<string[]>([]);
  const [tokens, setTokens] = useState<[string, [number, number]][]>([]);
  const [cardPositionKey, setCardPositionKey] = useState(1);

  const tokensMap = Object.fromEntries(tokens);

  const [exile, setExile] = useState<Datum[]>([]);
  const syncWithLiveData = useMutation(
    ({ storage }) => {
      if (player === 0) {
        storage.set(
          "playerOne",
          dataToLiveObject(
            hand,
            graveyard,
            exile,
            engaged,
            battlefield,
            deck,
            related.data,
            storage.get("playerOne")?.get("life"),
            tokens
          )
        );
      } else {
        storage.set(
          "playerTwo",
          dataToLiveObject(
            hand,
            graveyard,
            exile,
            engaged,
            battlefield,
            deck,
            related.data,
            storage.get("playerTwo")?.get("life"),
            tokens
          )
        );
      }
    },
    [
      deck,
      hand,
      graveyard,
      battlefield,
      engaged,
      player,
      exile,
      related.data, //tokens card
      tokens, // +x/+x
    ] // Works just like it would in useCallback
  );

  useEffect(() => {
    syncWithLiveData();
  }, [syncWithLiveData]);

  useEffect(() => {
    if (!data) {
      return;
    }
    let d = [];
    for (const card of data) {
      const amountInDeckToAdd = Number(
        //Support double faced card
        memoAmount.get(card.name.split("//")[0].trim())
      );
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
      setEngaged([]);
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
    toState((prev) => [...prev, { ...card, id: generateRandomID() }]);
  }

  function onReset() {
    queryClient.resetQueries();
  }

  function addToken(cardId: string, values: [number, number]) {
    tokensMap[cardId] = values;
    if (values[0] === 0 && values[1] === 0) {
      delete tokensMap[cardId];
    }
    setTokens(Object.entries(tokensMap));
  }

  function engageCard(cardId: string, engage: boolean) {
    if (engage) {
      setEngaged((prev) => [...prev, cardId]);
    } else {
      setEngaged((prev) => prev.filter((c) => c !== cardId));
    }
  }

  function draw() {
    if (deck.length === 0) return;
    setHand((prev) => [...prev, deck[0]]);
    setDeck((prev) => prev.slice(1));
  }

  console.log({ deck, data });

  return (
    <>
      room id: {room}
      {deckFromText.trim() === "" && (
        <form
          className={`${"flex flex-col grow-0 items-center content-center"}`}
          onSubmit={(e) => {
            e.preventDefault();
            const target = e.target as typeof e.target & {
              cards: { value: string };
            };
            setDeckFromText(target.cards.value);
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
          <button>Create deck</button>
        </form>
      )}
      {isLoading && fetchStatus !== "idle" && (
        <div
          style={{
            borderTopColor: "transparent",
          }}
          className="w-16 h-16 border-4 border-blue-400 border-solid rounded-full animate-spin"
        ></div>
      )}
      {isSuccess && (
        <>
          <h1 className="font-extrabold text-center">Opponent</h1>
          <div className="flex flex-col gap-4" key={cardPositionKey}>
            <div className="border-b-4">
              <OpponentBoard player={otherPlayer} />
            </div>
            <div>
              <Controls
                deck={deck}
                draw={draw}
                onShuffle={onShuffle}
                onReset={onReset}
                desengageAll={() => setEngaged([])}
                resetPosition={() => setCardPositionKey((prev) => prev + 1)}
              />
              <PlayerBoard
                hand={hand}
                battlefield={battlefield}
                graveyard={graveyard}
                exile={exile}
                engaged={engaged}
                engageCard={engageCard}
                addToken={addToken}
                tokensMap={tokensMap}
                tokens={related.data ?? []}
                sendCardTo={sendCardTo}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
