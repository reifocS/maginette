import { CardFromLiveList } from "@/types";
import { PropsCards } from "./Cards";
import Card from "./Card";

function groupLandCards(cards: CardFromLiveList): CardFromLiveList[] {
  let groupedLand: CardFromLiveList[] = [];
  let currentIndex = 0;
  let others: CardFromLiveList[] = [];
  for (const card of cards) {
    if (card.produced_mana) {
      if (groupedLand[currentIndex] && groupedLand[currentIndex].length > 2) {
        currentIndex++;
      }
      if (!groupedLand[currentIndex]) {
        groupedLand[currentIndex] = [];
      }
      groupedLand[currentIndex] = [...groupedLand[currentIndex], card];
    } else {
      others = [...others, [card]];
    }
  }
  return groupedLand.concat(others);
}

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
            />
          ))}
        </div>
      ))}
    </div>
  );
}
