import { useEffect, useMemo, useState } from "react";
import useCards from "@/hooks/useCards";
import { CardFromLiveList, Datum, Fields } from "@/types";
import { generateRandomID, shuffle } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import Loading from "@/components/Loading";
import Controls from "./Controls";
import PlayerBoard from "./PlayerBoard";
import {
  useStorage,
  useMutation,
  useBatch,
  useMyPresence,
  LiveCard,
} from "@/liveblocks.config";
import { LiveObject, LiveList, LiveMap } from "@liveblocks/client";
import OpponentBoard from "./OpponentBoard";
import { useRouter } from "next/router";
import useKeyPress from "@/hooks/useKeyPressed";

function processRawText(fromArena: string) {
  if (fromArena.trim() === "") return [];
  return new Set(
    fromArena
      .split("\n")
      .map((s) => {
        let withoutNumber = s.replace(/^[0-9]+/g, "").trim();
        if (withoutNumber.includes("//")) {
          //Double faced card
          return withoutNumber.split("//")[0].trim();
        }
        return withoutNumber;
      })
      .filter((s) => s !== "")
  );
}

function processCardWithTheirAmount(cards: string) {
  const map = new Map<string, number>();
  for (const card of cards.split("\n")) {
    let [amount, ...cardName] = card.split(" ");
    if (cardName.includes("//")) {
      //Double faced card
      cardName = cardName.slice(
        0,
        cardName.findIndex((c) => c === "//")
      );
    }
    map.set(cardName.join(" ").toLowerCase(), +amount);
  }
  return map;
}

type Props = {
  player: number;
};

function battlefieldToLiveList(data: readonly CardFromLiveList[]) {
  return new LiveList(data.map((arr) => dataToLiveList(arr)));
}

function dataToLiveList(data?: Datum[] | CardFromLiveList) {
  return new LiveList(
    data?.map((d) => {
      return new LiveObject({
        id: d.id,
        name: d.name,
        image_uris: new LiveObject({
          normal: d.image_uris?.normal,
          large: d.image_uris?.large,
        }),
        produced_mana: (d as Datum).produced_mana,
        card_faces: new LiveList(
          d.card_faces?.map((cf) => {
            return new LiveObject({
              name: cf.name,
              id: cf.id,
              image_uris: new LiveObject({
                normal: cf.image_uris?.normal,
                large: cf.image_uris?.large,
              }),
              produced_mana: cf.produced_mana,
            });
          })
        ),
      });
    })
  );
}

// function dataToLiveObject(
//   hand: Datum[],
//   graveyard: Datum[],
//   exile: Datum[],
//   engaged: string[],
//   battlefield: Datum[],
//   data?: Datum[],
//   related?: Datum[],
//   life?: number,
//   tokens?: [string, [number, number]][]
// ) {
//   return new LiveObject({
//     deck: dataToLiveList(data),
//     related: dataToLiveList(related),
//     hand: dataToLiveList(hand),
//     graveyard: dataToLiveList(graveyard),
//     exile: dataToLiveList(exile),
//     engaged: new LiveList(engaged),
//     battlefield: dataToLiveList(battlefield),
//     life: life!,
//     tokens: new LiveMap(tokens),
//   });
// }

export default function FullBoard({ player }: Props) {
  const [deckFromText, setDeckFromText] = useState("");
  const { data, isLoading, fetchStatus, isRefetching } = useCards(
    Array.from(processRawText(deckFromText)),
    onDeckDataFetched
  );
  const ctlrKey: boolean = useKeyPress("Control");

  const playerOne = useStorage((root) => root.playerOne);
  const playerTwo = useStorage((root) => root.playerTwo);

  const otherPlayer = player === 0 ? playerTwo : playerOne;
  const currentPlayer = player === 1 ? playerTwo : playerOne;

  const router = useRouter();
  const { room } = router.query;

  const allParts =
    data
      ?.filter((v) => v.all_parts && v.all_parts.length > 0)
      .flatMap((v) => v.all_parts) ?? [];

  const relatedQuery = useCards(
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
    ),
    onDeckRelatedFetched
  );
  const memoAmount = useMemo(
    () => processCardWithTheirAmount(deckFromText),
    [deckFromText]
  );

  const currentPlayerId = player === 0 ? "playerOne" : "playerTwo";
  const deck = useMemo(() => currentPlayer?.deck ?? [], [currentPlayer?.deck]);
  const hand = currentPlayer?.hand ?? [];
  const graveyard = currentPlayer?.graveyard ?? [];
  const battlefield: readonly CardFromLiveList[] =
    currentPlayer?.battlefield ?? [];
  const engaged = currentPlayer?.engaged ?? [];
  const exile = currentPlayer?.exile ?? [];
  const related = currentPlayer?.related ?? [];
  const batch = useBatch();
  const [, updateMyPresence] = useMyPresence();
  const tokens = Array.from(currentPlayer?.tokens.entries() ?? []);
  const selection = currentPlayer?.selected;

  const gKeyPressed = useKeyPress("g");

  const clearSelectionAndGroup = useMutation(({ storage }) => {
    const current = storage.get(currentPlayerId)?.get("selected") ?? [];
    if (current.length === 0) return;
    storage.get(currentPlayerId)?.set("selected", []);
    let actualBattlefield = storage
      .get(currentPlayerId)
      ?.get("battlefield")
      .toImmutable();
    if (!actualBattlefield) return;
    let newStack: CardFromLiveList = [];
    for (const stack of actualBattlefield) {
      let cardsToInclude: CardFromLiveList = [];
      for (const card of stack) {
        if (current.includes(card.id)) {
          cardsToInclude = [...cardsToInclude, card];
        }
      }
      if (cardsToInclude.length > 0) {
        newStack = [...newStack, ...cardsToInclude];
      }
    }
    console.log({ newStack });
    //start by removing the selected cards
    actualBattlefield = actualBattlefield.map((stack) =>
      stack.filter((card) => !current.includes(card.id))
    );
    console.log({ actualBattlefield });
    actualBattlefield = actualBattlefield.filter((stack) => stack.length > 0);
    //now push the stack at the beginning
    const newBattlefield = [newStack, ...actualBattlefield];
    storage
      .get(currentPlayerId)
      ?.set("battlefield", battlefieldToLiveList(newBattlefield));
  }, []);

  useEffect(() => {
    if (gKeyPressed) {
      clearSelectionAndGroup();
    }
  }, [gKeyPressed, clearSelectionAndGroup]);

  function onDeckDataFetched(data: Datum[]) {
    let d = [];
    for (const card of data) {
      const amountInDeckToAdd = Number(
        //Support double faced card
        memoAmount.get(card.name.split("//")[0].trim().toLowerCase())
      );
      for (let i = 0; i < amountInDeckToAdd; ++i) {
        d.push({ ...card, id: card.id + "-" + i });
      }
    }
    setDeck(shuffle(d));
  }

  const setSelection = useMutation(({ storage }, cardId: string) => {
    const current = storage.get(currentPlayerId)?.get("selected") ?? [];
    storage
      .get(currentPlayerId)
      ?.set(
        "selected",
        current?.find((id) => id === cardId)
          ? current.filter((id) => id !== cardId)
          : [...current, cardId]
      );
  }, []);

  function onDeckRelatedFetched(data: Datum[]) {
    if (data) {
      setRelated(data);
      //Hack to clear history
      // location.reload();
    }
  }

  const setDeck = useMutation(({ storage }, deck: CardFromLiveList) => {
    storage.get(currentPlayerId)?.set("deck", dataToLiveList(deck));
  }, []);
  const setHand = useMutation(({ storage }, hand: CardFromLiveList) => {
    storage.get(currentPlayerId)?.set("hand", dataToLiveList(hand));
  }, []);

  const setEngaged = useMutation(({ storage }, engaged: string[]) => {
    storage.get(currentPlayerId)?.set("engaged", new LiveList(engaged));
  }, []);

  const setBattlefield = useMutation(
    ({ storage }, battlefield: readonly CardFromLiveList[]) => {
      storage
        .get(currentPlayerId)
        ?.set("battlefield", battlefieldToLiveList(battlefield));
    },
    []
  );

  const setGraveyard = useMutation(
    ({ storage }, graveyard: CardFromLiveList) => {
      storage.get(currentPlayerId)?.set("graveyard", dataToLiveList(graveyard));
    },
    []
  );

  const setExile = useMutation(({ storage }, exile: CardFromLiveList) => {
    storage.get(currentPlayerId)?.set("exile", dataToLiveList(exile));
  }, []);
  const setTokens = useMutation(
    ({ storage }, tokens: [string, [number, number]][]) => {
      storage.get(currentPlayerId)?.set("tokens", new LiveMap(tokens));
    },
    []
  );
  const setRelated = useMutation(({ storage }, related: CardFromLiveList) => {
    storage.get(currentPlayerId)?.set("related", dataToLiveList(related));
  }, []);

  const [cardPositionKey, setCardPositionKey] = useState(1);
  const tokensMap = Object.fromEntries(tokens);

  function onShuffle() {
    setDeck(shuffle(deck));
  }

  const mappingFieldToStateSetter: Record<Fields, (d: any) => void> = {
    deck: setDeck,
    battlefield: setBattlefield,
    graveyard: setGraveyard,
    hand: setHand,
    exile: setExile,
    tokens: (t) => {
      throw new Error("Trying to change token state");
    },
  };

  const mappingFieldToLiveState: Record<
    Fields,
    CardFromLiveList | readonly CardFromLiveList[]
  > = {
    deck,
    battlefield,
    graveyard,
    hand,
    exile,
    tokens: related,
  };

  function searchCard(cardName: string) {
    const cardToAdd = deck.find((card) =>
      card.name.toLowerCase().includes(cardName.toLowerCase())
    );
    if (cardToAdd) {
      batch(() => {
        setDeck(deck.filter((c) => c.id !== cardToAdd.id));
        setHand([...hand, cardToAdd]);
      });
    }
  }

  function sendCardTo(from: Fields, to: Fields, card: Datum, payload?: any) {
    batch(() => {
      const fromStateSetter = mappingFieldToStateSetter[from];
      const toStateSetter = mappingFieldToStateSetter[to];
      const fromState = mappingFieldToLiveState[from];
      const toState = mappingFieldToLiveState[to];

      if (to === "deck") {
        if (!payload)
          throw new Error("Payload missing when sending card to deck");
        if (payload.position === "top") {
          setDeck([card, ...deck]);
        } else if (payload.position === "bottom") {
          setDeck([...deck, card]);
        }
        if (from === "battlefield") {
          fromStateSetter(
            (fromState as CardFromLiveList[]).map((stack) =>
              stack.filter((c) => c.id !== card.id)
            )
          );
        } else if (from !== "tokens") {
          fromStateSetter(
            (fromState as CardFromLiveList).filter((c) => c.id !== card.id)
          );
        }
        return;
      }
      if (from !== "tokens") {
        if (from !== "battlefield")
          fromStateSetter(
            (fromState as CardFromLiveList).filter((c) => c.id !== card.id)
          );
        else {
          fromStateSetter(
            (fromState as CardFromLiveList[]).map((stack) =>
              stack.filter((c) => c.id !== card.id)
            )
          );
        }
      }
      const id = generateRandomID();
      if (to === "battlefield") {
        updateMyPresence({ lastPlayedCard: id });
      } else {
        updateMyPresence({ lastPlayedCard: null });
      }
      if (to !== "battlefield") toStateSetter([...toState, { ...card, id }]);
      else {
        toStateSetter([...toState, [{ ...card, id }]]);
      }
    });
  }

  function onReset() {
    //queryClient.resetQueries();
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
      setEngaged([...engaged, cardId]);
    } else {
      setEngaged(engaged.filter((c) => c !== cardId));
    }
  }

  function draw() {
    if (deck.length === 0) return;
    batch(() => {
      setHand([...hand, deck[0]]);
      setDeck(deck.slice(1));
    });
  }

  const DEFAULT_DECK = [
    "3 Ambitious Farmhand",
    "4 Reckoner Bankbuster",
    "2 Elspeth Resplendent",
    "2 March of Otherworldly Light",
    "4 The Restoration of Eiganjo",
    "4 Roadside Reliquary",
    "1 Eiganjo, Seat of the Empire",
    "16 Plains",
    "4 Ossification",
    "4 Wedding Announcement",
    "2 Destroy Evil",
    "4 The Wandering Emperor",
    "4 Lay Down Arms",
    "3 The Eternal Wanderer",
    "3 Mirrex",
    "3 Depopulate",
    "2 Fateful Absence",
    "3 Farewell",
    "4 Sunset Revelry",
    "3 Loran of the Third Path",
  ];

  const gameStarted =
    deck.length > 0 ||
    battlefield.length > 0 ||
    graveyard.length > 0 ||
    exile.length > 0 ||
    hand.length > 0;

  return (
    <>
      <span className="underline">room id:</span> {room}
      {((isLoading &&
        fetchStatus !== "idle") || isRefetching) &&
        Loading({ message: "Loading game board..." })}
      {!(isLoading && fetchStatus !== "idle") && !gameStarted && (
        <div className="flex h-full">
          <form
            className="m-auto flex flex-col grow-0 items-center content-center"
            onSubmit={(e) => {
              e.preventDefault();
              const target = e.target as typeof e.target & {
                cards: { value: string };
              };
              setDeckFromText(target.cards.value);
            }}
          >
            <label htmlFor="cards" className="text-xl font-bold py-3">
              Paste deck here, in text format (MTGO)
            </label>

            <textarea
              name="cards"
              className="text-lg mb-6"
              id="cards"
              cols={40}
              rows={10}
              defaultValue={DEFAULT_DECK.join("\n")}
            ></textarea>

            <button className="w-full text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">
              Create deck
            </button>
          </form>
        </div>
      )}
      {gameStarted && (
        <div className="p-4 select-none">
          <h1 className="font-extrabold text-center text-2xl">Opponent</h1>
          <div className="flex flex-col" key={cardPositionKey}>
            <div className="border-b-2 border-slate-500">
              <OpponentBoard ctrlKey={ctlrKey} player={otherPlayer} />
            </div>
            <div id="player_board">
              <Controls
                deck={deck}
                draw={draw}
                onShuffle={onShuffle}
                onReset={onReset}
                desengageAll={() => {
                  setEngaged([]);
                }}
                resetPosition={() => setCardPositionKey((prev) => prev + 1)}
                searchCard={searchCard}
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
                tokens={related}
                sendCardTo={sendCardTo}
                cardSelection={selection}
                setSelection={setSelection}
                ctrlKey={ctlrKey}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
