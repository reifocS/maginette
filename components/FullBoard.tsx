import { useEffect, useMemo, useState } from "react";
import useCards from "@/hooks/useCards";
import { CardFromLiveList, Datum, Fields } from "@/types";
import { generateRandomID, shuffle } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import Controls from "./Controls";
import PlayerBoard from "./PlayerBoard";
import {
  useStorage,
  useMutation,
  useBatch,
  useMyPresence,
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

function dataToLiveList(data?: Datum[] | CardFromLiveList) {
  return new LiveList(
    data?.map(
      (d) =>
        new LiveObject({
          id: d.id,
          name: d.name,
          image_uris: new LiveObject({
            normal: d.image_uris?.normal,
            large: d.image_uris?.large,
          }),
          card_faces: new LiveList(
            d.card_faces?.map(
              (cf) =>
                new LiveObject({
                  name: cf.name,
                  id: cf.id,
                  image_uris: new LiveObject({
                    normal: cf.image_uris.normal,
                    large: cf.image_uris.large,
                  }),
                })
            )
          ),
        })
    )
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
  const { data, isLoading, fetchStatus } = useCards(
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
  const battlefield = currentPlayer?.battlefield ?? [];
  const engaged = currentPlayer?.engaged ?? [];
  const exile = currentPlayer?.exile ?? [];
  const related = currentPlayer?.related ?? [];
  const batch = useBatch();
  const [, updateMyPresence] = useMyPresence();
  const tokens = Array.from(currentPlayer?.tokens.entries() ?? []);

  function onDeckDataFetched(data: Datum[]) {
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
  }

  function onDeckRelatedFetched(data: Datum[]) {
    if (data) {
      setRelated(data);
      //Hack to clear history
      location.reload();
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
    ({ storage }, battlefield: CardFromLiveList) => {
      storage
        .get(currentPlayerId)
        ?.set("battlefield", dataToLiveList(battlefield));
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

  //TODO move this data select to onSuccess cb of usequery
  useEffect(() => {}, [data, memoAmount, deck, setDeck]);

  function onShuffle() {
    setDeck(shuffle(deck));
  }

  const mappingFieldToStateSetter: Record<
    Fields,
    (deck: CardFromLiveList) => void
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

  const mappingFieldToLiveState: Record<Fields, CardFromLiveList> = {
    deck,
    battlefield,
    graveyard,
    hand,
    exile,
    tokens: related,
  };

  function searchCard(cardName: string) {
    const cardToAdd = deck.find((card) =>
      card.name.toLowerCase().includes(cardName)
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
        if (from !== "tokens") {
          fromStateSetter(fromState.filter((c) => c.id !== card.id));
        }
        return;
      }
      if (from !== "tokens") {
        fromStateSetter(fromState.filter((c) => c.id !== card.id));
      }
      const id = generateRandomID();
      if (to === "battlefield") {
        updateMyPresence({ lastPlayedCard: id });
      } else {
        updateMyPresence({ lastPlayedCard: null });
      }
      toStateSetter([...toState, { ...card, id }]);
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

  const gameStarted =
    deck.length > 0 ||
    battlefield.length > 0 ||
    graveyard.length > 0 ||
    exile.length > 0 ||
    hand.length > 0;

  return (
    <>
      {isLoading && fetchStatus !== "idle" && (
        <div
          style={{
            borderTopColor: "transparent",
          }}
          className="w-16 ml-2 h-16 border-4 border-blue-400 border-solid rounded-full animate-spin"
        ></div>
      )}
      room id: {room}
      {!gameStarted && (
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
      {(gameStarted) && (
        <>
          <h1 className="font-extrabold text-center">Opponent</h1>
          <div className="flex flex-col gap-4" key={cardPositionKey}>
            <div className="border-b-4">
              <OpponentBoard ctrlKey={ctlrKey} player={otherPlayer} />
            </div>
            <div id="player_board">
              <Controls
                deck={deck}
                draw={draw}
                onShuffle={onShuffle}
                onReset={onReset}
                desengageAll={() => setEngaged([])}
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
                ctrlKey={ctlrKey}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
