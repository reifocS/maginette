import { CardFromLiveList, Datum, Fields } from "@/types";
import Card from "./Card";

export type PropsCards = {
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
  ctrlKey: boolean;
  setSwapped: (swapped: string[]) => void;
  swapped: readonly string[];
  giveCardToOpponent: (cardId: string) => void;
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
  tokensMap,
  ctrlKey,
  setSwapped,
  swapped,
}: PropsCards) {
  return (
    <ul className="flex gap-3 flex-wrap min-h-[253px]">
      {!cards.length && (
        <div className="flex w-full text-center">
          <p className="m-auto text-gray-400">No card here yet...</p>
        </div>
      )}
      {cards.map((v) => (
        <li key={v.id}>
          <Card
            ctrlKey={ctrlKey}
            card={v}
            field={field}
            show={show}
            isOpponent={isOpponent}
            sendCardTo={sendCardTo}
            engaged={engaged}
            setSwapped={setSwapped}
            swapped={swapped}
            engageCard={engageCard}
            addToken={addToken}
            tokensMap={tokensMap}
          />
        </li>
      ))}
    </ul>
  );
}
