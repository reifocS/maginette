import { CardFromLiveList, Datum, Fields } from "@/types";
import Cards from "./Cards";
import Battlefield from "./Battlefield";
import Hand from "./Hand";

type PlayerBoardProps = {
  hand: CardFromLiveList;
  battlefield: readonly CardFromLiveList[];
  graveyard: CardFromLiveList;
  exile: CardFromLiveList;
  tokens: CardFromLiveList;
  engaged: readonly string[];
  engageCard: (cardId: string, e: boolean) => void;
  sendCardTo: (from: Fields, to: Fields, card: Datum, payload?: any) => void;
  addToken: (cardId: string, values: [number, number]) => void;
  tokensMap: {
    [k: string]: [number, number];
  };
  ctrlKey: boolean;
  cardSelection?: string[];
  setSelection: (id: string) => void;
  setSwapped: (swapped: string[]) => void;
  swapped: readonly string[];
};

export default function PlayerBoard({
  sendCardTo,
  graveyard,
  exile,
  battlefield,
  hand,
  addToken,
  tokens,
  engageCard,
  engaged,
  tokensMap,
  cardSelection = [],
  ctrlKey,
  setSelection,
  setSwapped,
  swapped,
}: PlayerBoardProps) {
  return (
    <>
      <p className="text-xl font-extrabold">Battlefield</p>
      <Battlefield
        cardSelection={cardSelection}
        cards={battlefield}
        show={true}
        field="battlefield"
        engaged={engaged}
        engageCard={engageCard}
        sendCardTo={sendCardTo}
        addToken={addToken}
        tokensMap={tokensMap}
        setSelection={setSelection}
        ctrlKey={ctrlKey}
        setSwapped={setSwapped}
        swapped={swapped}
      />
      <p className="text-xl font-extrabold">Hand</p>
      <Hand
        cards={hand}
        show={true}
        field="hand"
        sendCardTo={sendCardTo}
        engaged={engaged}
        engageCard={engageCard}
        addToken={addToken}
        tokensMap={tokensMap}
        setSwapped={setSwapped}
        swapped={swapped}
        ctrlKey={ctrlKey}
      />
      <details>
        <summary>Graveyard</summary>

        <Cards
          cards={graveyard}
          show={true}
          field="graveyard"
          engaged={engaged}
          setSwapped={setSwapped}
          swapped={swapped}
          engageCard={engageCard}
          sendCardTo={sendCardTo}
          addToken={addToken}
          tokensMap={tokensMap}
          ctrlKey={ctrlKey}
        />
      </details>

      <details>
        <summary>Exile</summary>
        <Cards
          cards={exile}
          show={true}
          field="exile"
          sendCardTo={sendCardTo}
          engaged={engaged}
          engageCard={engageCard}
          addToken={addToken}
          tokensMap={tokensMap}
          setSwapped={setSwapped}
          swapped={swapped}
          ctrlKey={ctrlKey}
        />
      </details>
      <details open>
        <summary>Related cards</summary>

        <Cards
          cards={tokens}
          show={true}
          engaged={engaged}
          engageCard={engageCard}
          field="tokens"
          sendCardTo={sendCardTo}
          addToken={addToken}
          tokensMap={tokensMap}
          setSwapped={setSwapped}
          swapped={swapped}
          ctrlKey={ctrlKey}
        />
      </details>
    </>
  );
}
