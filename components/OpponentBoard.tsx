import { CardFromLiveList, Datum, Fields } from "@/types";
import Cards from "./Cards";

type Props = {
  player: {
    readonly deck: CardFromLiveList;
    readonly related: CardFromLiveList;
    readonly graveyard: CardFromLiveList;
    readonly exile: CardFromLiveList;
    readonly hand: CardFromLiveList;
    readonly battlefield: CardFromLiveList;
    readonly engaged: readonly string[];
  } | null;
};

export default function OpponentBoard({ player }: Props) {
  return (
    <div>
      <p className="text-xl font-extrabold">hand</p>
      <div className="overflow-auto flex">
        {player?.hand?.map((c) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={c.id}
            alt="hidden card"
            className="w-[100px] h-170px]"
            src="https://upload.wikimedia.org/wikipedia/en/thumb/a/aa/Magic_the_gathering-card_back.jpg/200px-Magic_the_gathering-card_back.jpg"
          ></img>
        ))}
      </div>
      <p className="text-xl font-extrabold">exile</p>

      <summary>
        <details>
          <Cards
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
          />
        </details>
      </summary>
      <p className="text-xl font-extrabold">graveyard</p>

      <summary>
        <details>
          <Cards
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
          />
        </details>
      </summary>

      <p className="text-xl font-extrabold">battlefield</p>
      <Cards
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
      />
    </div>
  );
}
