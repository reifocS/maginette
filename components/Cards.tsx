import { CardFromLiveList, Datum, Fields } from "@/types";
import Card from "./Card";

type PropsCards = {
  cards: Datum[] | CardFromLiveList;
  show: boolean;
  field: Fields;
  engaged: string[];
  engageCard: (cardId: string, e: boolean) => void;
  sendCardTo(from: Fields, to: Fields, card: Datum, payload?: any): void;
  isOpponent?: boolean;
};
export default function Cards({
  cards,
  show,
  field,
  sendCardTo,
  engageCard,
  engaged,
  isOpponent = false,
}: PropsCards) {
  return (
    <ul className="flex gap-3 flex-wrap">
      {cards.map((v) => (
        <li key={v.id}>
          <Card
            card={v}
            field={field}
            show={show}
            isOpponent={isOpponent}
            sendCardTo={sendCardTo}
            engaged={engaged}
            engageCard={engageCard}
          />
        </li>
      ))}
    </ul>
  );
}
