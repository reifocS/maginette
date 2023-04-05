import { Datum, Fields } from "@/types";
import Cards from "./Cards";
import Card from "./Card";

type PlayerBoardProps = {
  hand: Datum[];
  deck: Datum[];
  battlefield: Datum[];
  graveyard: Datum[];
  exile: Datum[];
  draw: () => void;
  tokens: Datum[];
  engaged: string[];
  engageCard: (cardId: string, e: boolean) => void;
  sendCardTo: (from: Fields, to: Fields, card: Datum, payload?: any) => void;
};

export default function PlayerBoard({
  sendCardTo,
  graveyard,
  exile,
  battlefield,
  hand,
  deck,
  draw,
  tokens,
  engageCard,
  engaged,
}: PlayerBoardProps) {
  return (
    <>
      <div onClick={draw}>
        {deck[0] && (
          <Card
            card={deck[0]}
            field={"deck"}
            show={false}
            engaged={engaged}
            isOpponent={false}
            engageCard={engageCard}
            sendCardTo={sendCardTo}
          />
        )}
      </div>
      <p className="text-xl font-extrabold">Battlefield</p>
      <Cards
        cards={battlefield}
        show={true}
        field="battlefield"
        engaged={engaged}
        engageCard={engageCard}
        sendCardTo={sendCardTo}
      />
      <p className="text-xl font-extrabold">Hand</p>
      <Cards
        cards={hand}
        show={true}
        field="hand"
        sendCardTo={sendCardTo}
        engaged={engaged}
        engageCard={engageCard}
      />
      <p className="text-xl font-extrabold">Graveyard</p>
      <Cards
        cards={graveyard}
        show={true}
        field="graveyard"
        engaged={engaged}
        engageCard={engageCard}
        sendCardTo={sendCardTo}
      />
      <p className="text-xl font-extrabold">Exile</p>
      <Cards
        cards={exile}
        show={true}
        field="exile"
        sendCardTo={sendCardTo}
        engaged={engaged}
        engageCard={engageCard}
      />
      <p className="text-xl font-extrabold">Tokens</p>
      <Cards
        cards={tokens}
        show={true}
        engaged={engaged}
        engageCard={engageCard}
        field="tokens"
        sendCardTo={sendCardTo}
      />
    </>
  );
}
