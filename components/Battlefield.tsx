import { CardFromLiveList } from "@/types";
import { PropsCards } from "./Cards";
import Card from "./Card";

export default function Battlefield({
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
  setSelection,
  cardSelection,
  swapped,
  setSwapped,
}: Omit<PropsCards, "cards"> & {
  setSelection: (cardId: string) => void;
  cards: readonly CardFromLiveList[];
  cardSelection: string[];
}) {
  // const grouped = groupLandCards(cards);
  return (
    <div className="flex flex-wrap min-h-[253px] gap-4">
      {!cards.length && (
        <div className="flex w-full text-center">
          <p className="m-auto text-gray-400">No card here yet...</p>
        </div>
      )}
      {cards.map((group) => (
        <div
          className="flex flex-col battlefield"
          key={group.map((g) => g.id).join("")}
        >
          {group.map((g) => (
            <Card
              setSelection={setSelection}
              key={g.id}
              ctrlKey={ctrlKey}
              card={g}
              field={field}
              show={show}
              isOpponent={!!isOpponent}
              sendCardTo={sendCardTo}
              engaged={engaged}
              engageCard={engageCard}
              cardSelection={cardSelection}
              addToken={addToken}
              tokensMap={tokensMap}
              swapped={swapped}
              setSwapped={setSwapped}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
