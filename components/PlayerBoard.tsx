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

      <summary>
        <details>
          <Cards
            cards={graveyard}
            show={true}
            field="graveyard"
            engaged={engaged}
            engageCard={engageCard}
            sendCardTo={sendCardTo}
          />
        </details>
      </summary>

      <p className="text-xl font-extrabold">Exile</p>
      <summary>
        <details>
          <Cards
            cards={exile}
            show={true}
            field="exile"
            sendCardTo={sendCardTo}
            engaged={engaged}
            engageCard={engageCard}
          />
        </details>
      </summary>

      <p className="text-xl font-extrabold">Tokens</p>
      <summary>
        <details>
          <Cards
            cards={tokens}
            show={true}
            engaged={engaged}
            engageCard={engageCard}
            field="tokens"
            sendCardTo={sendCardTo}
          />
        </details>
      </summary>
    </>
  );
}
