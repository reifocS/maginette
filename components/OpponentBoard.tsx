import { CardFromLiveList, Datum, Fields, OpponentCard } from "@/types";
import Cards from "./Cards";
import Battlefield from "./Battlefield";
import { GameData, LiveCard } from "@/liveblocks.config";

type Props = {
  player: Readonly<GameData> | null;
  ctrlKey: boolean;
};

export default function OpponentBoard({ player, ctrlKey }: Props) {
  const tokens = Object.fromEntries(player?.tokens?.entries() ?? []);

  function idsToFullCard(ids: string[]): CardFromLiveList {
    return ids.map((id) => player?.allCards?.get(id)!).filter(Boolean) as any;
  }

  console.log({ player });
  return (
    <div>
      <p className="text-xl font-extrabold">Hand</p>
      <div className="overflow-auto flex">
        {player?.hand?.map((c) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={c}
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
          cards={idsToFullCard(player?.exile ?? [])}
          show={true}
          field={"graveyard"}
          engaged={[]}
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
          setSwapped={function (swapped: string[]): void {
            throw new Error("Function not implemented.");
          }}
          swapped={[]}
          giveCardToOpponent={function (cardId: string): void {
            throw new Error("Function not implemented.");
          }}
        />
      </details>

      <details>
        <summary>Graveyard</summary>
        <Cards
          ctrlKey={ctrlKey}
          cards={idsToFullCard(player?.graveyard ?? [])}
          show={true}
          field={"graveyard"}
          engaged={[]}
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
          setSwapped={function (swapped: string[]): void {
            throw new Error("Function not implemented.");
          }}
          swapped={[]}
          giveCardToOpponent={function (cardId: string): void {
            throw new Error("Function not implemented.");
          }}
        />
      </details>

      <p className="text-xl font-extrabold">Battlefield</p>
      <Battlefield
        ctrlKey={ctrlKey}
        cards={
          player?.battlefield
            .map((stack) => idsToFullCard(stack))
            .filter((s) => s.length > 0) ?? []
        }
        show={true}
        field={"battlefield"}
        engaged={player?.engaged ? [...(player.engaged as any)] : []}
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
        swapped={player?.swapped ? [...player.swapped] : []}
        setSwapped={function (swapped: string[]): void {
          throw new Error("Function not implemented.");
        }}
        giveCardToOpponent={function (cardId: string): void {
          throw new Error("Function not implemented.");
        }}
      />
    </div>
  );
}
