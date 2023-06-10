import {
  useStorage,
  useMutation,
  LiveCard,
  dataToLiveList,
  GameData,
  datumToLiveCard,
} from "@/liveblocks.config";
import { CardFromLiveList } from "@/types";
import { generateRandomID } from "@/utils";
import { LiveMap, LiveList } from "@liveblocks/client";

export default function useMultiplayer(
  currentPlayerId: "playerOne" | "playerTwo"
) {
  const playerOne = useStorage((root) => root.playerOne);
  const playerTwo = useStorage((root) => root.playerTwo);
  const otherPlayerId =
    currentPlayerId === "playerOne" ? "playerTwo" : "playerOne";
  const clearSelectionAndGroup = useMutation(({ storage }) => {
    const current = storage.get(currentPlayerId)?.get("selected") ?? [];
    if (current.length === 0) return;
    storage.get(currentPlayerId)?.set("selected", []);
    let actualBattlefield = storage.get(currentPlayerId)?.get("battlefield");
    if (!actualBattlefield) return;
    let newStack: string[] = [];
    for (const stack of actualBattlefield) {
      let cardsToInclude: string[] = [];
      for (const card of stack) {
        if (current.includes(card)) {
          cardsToInclude = [...cardsToInclude, card];
        }
      }
      if (cardsToInclude.length > 0) {
        newStack = [...newStack, ...cardsToInclude];
      }
    }
    //start by removing the selected cards
    actualBattlefield = actualBattlefield.map((stack) =>
      stack.filter((card) => !current.includes(card))
    );
    actualBattlefield = actualBattlefield.filter((stack) => stack.length > 0);
    //now push the stack at the beginning
    const newBattlefield = [newStack, ...actualBattlefield];
    storage.get(currentPlayerId)?.set("battlefield", newBattlefield);
  }, []);

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

  const setAllCards = useMutation(
    ({ storage }, allCards: [string, LiveCard][]) => {
      storage.get(currentPlayerId)?.set("allCards", new LiveMap(allCards));
    },
    []
  );

  //Create a new card and add it to our map
  const appendAllCards = useMutation(({ storage }, newCard: LiveCard) => {
    storage
      .get(currentPlayerId)
      ?.get("allCards")
      .set(newCard.get("id"), newCard);
  }, []);

  const setDeck = useMutation(({ storage }, deck: string[]) => {
    storage.get(currentPlayerId)?.set("deck", deck);
  }, []);
  const setHand = useMutation(({ storage }, hand: string[]) => {
    storage.get(currentPlayerId)?.set("hand", hand);
  }, []);

  const setEngaged = useMutation(({ storage }, engaged: string[]) => {
    storage.get(currentPlayerId)?.set("engaged", new LiveList(engaged));
  }, []);

  const setBattlefield = useMutation(({ storage }, battlefield: string[][]) => {
    storage.get(currentPlayerId)?.set("battlefield", battlefield);
  }, []);

  const setGraveyard = useMutation(({ storage }, graveyard: string[]) => {
    storage.get(currentPlayerId)?.set("graveyard", graveyard);
  }, []);

  const setExile = useMutation(({ storage }, exile: string[]) => {
    storage.get(currentPlayerId)?.set("exile", exile);
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

  const setSwapped = useMutation(({ storage }, swapped: string[]) => {
    storage.get(currentPlayerId)?.set("swapped", swapped);
  }, []);

  const giveCardToOpponent = useMutation(({ storage }, cardId: string) => {
    const card = storage
      .get(currentPlayerId)
      ?.get("allCards")
      .get(cardId)
      ?.toImmutable();
    if (!card) {
      throw new Error("Card to give to opponent does not exist");
    }
    const newId = generateRandomID();
    const battlefieldOpponent = storage.get(otherPlayerId)?.get("battlefield")!;
    const battlefieldPlayer = storage.get(currentPlayerId)?.get("battlefield")!;
    storage
      .get(otherPlayerId)
      ?.set("battlefield", [...battlefieldOpponent, [newId]]);
    storage.get(currentPlayerId)?.set(
      "battlefield",
      battlefieldPlayer.map((stack) => stack.filter((c) => c !== card.id))
    );
    storage
      .get(otherPlayerId)
      ?.get("allCards")
      .set(newId, datumToLiveCard({ ...card, id: newId } as any));
  }, []);

  return {
    playerOne,
    playerTwo,
    clearSelectionAndGroup,
    setAllCards,
    setBattlefield,
    setDeck,
    setEngaged,
    setExile,
    setGraveyard,
    setHand,
    setRelated,
    setSelection,
    setSwapped,
    setTokens,
    appendAllCards,
    giveCardToOpponent,
  };
}
