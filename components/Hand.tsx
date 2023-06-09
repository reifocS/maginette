import { PropsCards } from "./Cards";
import Card from "./Card";

export default function Hand({
  cards,
  ctrlKey,
  field,
  show,
  isOpponent,
  sendCardTo,
  engaged,
  engageCard,
  addToken,
  tokensMap,
  swapped,
  setSwapped,
}: PropsCards) {
  return (
    <div className="flex-wrap flex">
      {cards.map((v, i) => (
        <div key={v.id} className="hand">
          <Card
            card={v}
            field={field}
            show={show}
            isOpponent={!!isOpponent}
            sendCardTo={sendCardTo}
            engaged={engaged}
            engageCard={engageCard}
            addToken={addToken}
            tokensMap={tokensMap}
            overrideZindex={cards.length - i}
            ctrlKey={ctrlKey}
            swapped={swapped}
            setSwapped={setSwapped}
          />
        </div>
      ))}
    </div>
  );
}
