import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import { useState } from "react";
import useCards from "@/hooks/useCards";
import { Datum } from "@/types";
import { cpSync } from "fs";

const inter = Inter({ subsets: ["latin"] });

function processRawText(fromArena: string) {
  if (fromArena.trim() === "") return [];
  return new Set(
    fromArena
      .split("\n")
      .map((s) => s.replace(/^[0-9]+/g, "").trim())
      .filter((s) => s !== "")
  );
}

type PropsCard = {
  card: Datum;
};
type PropsCards = {
  cards: Datum[];
};
function Cards({ cards }: PropsCards) {
  return (
    <ul className="flex gap-3 flex-wrap">
      {cards.map((v) => (
        <li key={v.id}>
          <Card card={v} />
        </li>
      ))}
    </ul>
  );
}

function CardSwap({ card }: PropsCard) {
  const [swap, setSwap] = useState(false);
  const index = swap ? 1 : 0;
  const src = card.card_faces![index];
  return (
    <img
      onClick={() => setSwap((prev) => !prev)}
      src={src.image_uris.small}
      alt={src.name}
    ></img>
  );
}

function Card({ card }: PropsCard) {
  if (card.card_faces) {
    return <CardSwap card={card} />;
  }
  return <img src={card.image_uris?.small} alt={card.name}></img>;
}

export default function Home() {
  const [copyFromArena, setCopyFromArena] = useState("");
  const cards = useCards(Array.from(processRawText(copyFromArena)));
  const allParts =
    cards.data?.data
      .filter((v) => v.all_parts && v.all_parts.length > 0)
      .flatMap((v) => v.all_parts) ?? [];

  const related = useCards(Array.from(new Set(allParts.map((v) => v.name))));
  const cardsInDeck = new Map();

  console.log(allParts);
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const target = e.target as typeof e.target & {
            cards: { value: string };
          };
          setCopyFromArena(target.cards.value);
        }}
        className="flex flex-col grow-0 items-center content-center"
      >
        <label htmlFor="cards">Paste deck here</label>
        <textarea name="cards" id="cards" cols={30} rows={10}></textarea>
        <button>Submit</button>
      </form>
      <p className="text-xl font-extrabold">Deck</p>
      {cards.data && <Cards cards={cards.data.data} />}
      <p className="text-xl font-extrabold">Tokens</p>
      {related.data && <Cards cards={related.data.data} />}
    </>
  );
}
