import { CardFromLiveList, Datum, Fields } from "@/types";
import Cards from "./Cards";
import Battlefield from "./Battlefield";

type Props = {
  player: {
    readonly deck: CardFromLiveList;
    readonly related: CardFromLiveList;
    readonly graveyard: CardFromLiveList;
    readonly exile: CardFromLiveList;
    readonly hand: CardFromLiveList;
    readonly battlefield: readonly CardFromLiveList[];
    readonly engaged: readonly string[];
    readonly tokens: ReadonlyMap<string, [number, number]>;
  } | null;
  ctrlKey: boolean;
};

export default function OpponentBoard({ player, ctrlKey }: Props) {
  const tokens = Object.fromEntries(player?.tokens?.entries() ?? []);
  return (
    <div>
      <p className="text-xl font-extrabold">Hand</p>
      <div className="overflow-auto flex">
        {player?.hand?.map((c) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={c.id}
            alt="hidden card"
            className="w-[80px] h-[110px]"
            src="https://upload.wikimedia.org/wikipedia/en/thumb/a/aa/Magic_the_gathering-card_back.jpg/200px-Magic_the_gathering-card_back.jpg"
          ></img>
        ))}
      </div>
      <details>
        <summary>Exile</summary>
        <Cards
          ctrlKey={ctrlKey}
          cards={player?.exile ?? []}
          show={true}
          field={"graveyard"}
          engaged={player?.engaged ? [...player.engaged] : []}
          engageCard={function (cardId: string, e: boolean): void {
            throw new Error("Should never happen.");
          }}
          sendCardTo={function (
            from: Fields,
            to: Fields,
            card: Datum,
            payload?: any
          ): void {
            throw new Error("Should never happen.");
          }}
          isOpponent={true}
          addToken={function (
            cardId: string,
            [power, thougness]: [number, number]
          ): void {
            throw new Error("Should never happen.");
          }}
          tokensMap={tokens}
        />
      </details>

      <details>
        <summary>Graveyard</summary>
        <Cards
          ctrlKey={ctrlKey}
          cards={player?.graveyard ?? []}
          show={true}
          field={"graveyard"}
          engaged={player?.engaged ? [...player.engaged] : []}
          engageCard={function (cardId: string, e: boolean): void {
            throw new Error("Should never happen.");
          }}
          sendCardTo={function (
            from: Fields,
            to: Fields,
            card: Datum,
            payload?: any
          ): void {
            throw new Error("Should never happen.");
          }}
          isOpponent={true}
          addToken={function (
            cardId: string,
            [power, thougness]: [number, number]
          ): void {
            throw new Error("Should never happen.");
          }}
          tokensMap={tokens}
        />
      </details>

      <p className="text-xl font-extrabold">Battlefield</p>
      <Battlefield
        ctrlKey={ctrlKey}
        cards={player?.battlefield ?? []}
        show={true}
        field={"battlefield"}
        engaged={player?.engaged ? [...player.engaged] : []}
        engageCard={function (cardId: string, e: boolean): void {
          throw new Error("Should never happen.");
        }}
        sendCardTo={function (
          from: Fields,
          to: Fields,
          card: Datum,
          payload?: any
        ): void {
          throw new Error("Should never happen.");
        }}
        isOpponent={true}
        addToken={function (
          cardId: string,
          [power, thougness]: [number, number]
        ): void {
          throw new Error("Should never happen.");
        }}
        tokensMap={tokens}
        setSelection={function (cardId: string): void {
          throw new Error("Should never happen.");
        }}
        cardSelection={[]}
      />
    </div>
  );
}
