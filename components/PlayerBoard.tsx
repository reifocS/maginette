import { CardFromLiveList, Datum, Fields } from "@/types";
import Cards from "./Cards";

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
  ctrlKey
}: PlayerBoardProps) {
  return (
    <>
      <p className="text-xl font-extrabold">Battlefield <span className="font-normal text-sm">ctrl + click: graveyard, shift+click: engage</span></p> 
      <Cards
        cards={battlefield}
        show={true}
        field="battlefield"
        engaged={engaged}
        engageCard={engageCard}
        sendCardTo={sendCardTo}
        addToken={addToken}
        tokensMap={tokensMap}
        ctrlKey={ctrlKey}
      />
      <p className="text-xl font-extrabold">Hand <span className="font-normal text-sm">drag to opponents board or shift click to send to battlefield</span></p>
      <Cards
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
            addToken={addToken}
            tokensMap={tokensMap}
            ctrlKey={ctrlKey}
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
            addToken={addToken}
            tokensMap={tokensMap}
            ctrlKey={ctrlKey}
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
            addToken={addToken}
            tokensMap={tokensMap}
            ctrlKey={ctrlKey}
          />
        </details>
      </summary>
    </>
  );
}
