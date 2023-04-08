import { CardFromLiveList, Datum, Fields } from "@/types";
import Card from "./Card";

type PropsCards = {
  cards: Datum[] | CardFromLiveList;
  show: boolean;
  field: Fields;
  engaged: readonly string[];
  engageCard: (cardId: string, e: boolean) => void;
  sendCardTo(from: Fields, to: Fields, card: Datum, payload?: any): void;
  isOpponent?: boolean;
  addToken: (cardId: string, [power, thougness]: [number, number]) => void;
  tokensMap: {
    [k: string]: [number, number];
  };
};
export default function Cards({
  cards,
  show,
  field,
  sendCardTo,
  engageCard,
  engaged,
  isOpponent = false,
  addToken,
  tokensMap
}: PropsCards) {
  return (
    <ul className="flex flex-wrap z-auto">
      {cards.map((v) => (
        <li key={v.id} className="card">
          <Card
            card={v}
            field={field}
            show={show}
            isOpponent={isOpponent}
            sendCardTo={sendCardTo}
            engaged={engaged}
            engageCard={engageCard}
            addToken={addToken}
            tokensMap={tokensMap}
          />
        </li>
      ))}
    </ul>
  );
}
