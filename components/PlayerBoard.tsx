import { CardFromLiveList, Datum, Fields } from "@/types";
import Cards from "./Cards";
import Battlefield from "./Battlefield";
import Hand from "./Hand";

type PlayerBoardProps = {
  hand: CardFromLiveList;
  battlefield: CardFromLiveList;
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
};

function groupByName(cards: CardFromLiveList) {
  return [...cards].sort((a, b) => a.name.localeCompare(b.name));
}

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
  ctrlKey,
}: PlayerBoardProps) {
  return (
    <>
      <p className="text-xl font-extrabold">Battlefield</p>
      <Battlefield
        cards={groupByName(battlefield)}
        show={true}
        field="battlefield"
        engaged={engaged}
        engageCard={engageCard}
        sendCardTo={sendCardTo}
        addToken={addToken}
        tokensMap={tokensMap}
        ctrlKey={ctrlKey}
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
        ctrlKey={ctrlKey}
      />
      <details>
        <summary>Graveyard</summary>

        <Cards
          cards={graveyard}
          show={true}
          field="graveyard"
          engaged={engaged}
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
          ctrlKey={ctrlKey}
        />
      </details>
    </>
  );
}
