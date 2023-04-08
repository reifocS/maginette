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
      <div className="font-normal shortcut_container">
        <b className="text-xl">Battlefield</b> <kbd>ctrl</kbd> <kbd>click</kbd>
        graveyard<kbd>shift</kbd>
        <kbd>click</kbd>engage <kbd>alt</kbd>
        <kbd>click</kbd>exile
      </div>
      <Cards
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
      <p className="text-xl font-extrabold">
        Hand{" "}
        <span className="font-normal text-sm">
          drag to opponents board or shift click to send to battlefield
        </span>
      </p>
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

      <div className="font-normal shortcut_container">
        <b className="text-xl">Tokens</b> <kbd>shift</kbd> <kbd>click</kbd>
        battlefield
      </div>
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
