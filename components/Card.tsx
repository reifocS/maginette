import { Datum, Fields, OpponentCard, Point } from "@/types";
import { useGesture } from "@use-gesture/react";
import { useState, useRef } from "react";
import CustomContextMenu from "./ContextMenu";
import { useMyPresence, useOthers } from "@/liveblocks.config";
import { createPortal } from "react-dom";

type PropsCard = {
  card: Datum | OpponentCard;
  show: boolean;
  field: Fields;
  engaged: readonly string[];
  isOpponent: boolean;
  engageCard: (cardId: string, e: boolean) => void;
  sendCardTo(from: Fields, to: Fields, card: Datum, payload?: any): void;
  addToken: (cardId: string, [power, thougness]: [number, number]) => void;
  tokensMap: {
    [k: string]: [number, number];
  };
};

let zIndex = 1;
const gridSize = 10;
export default function Card({
  card,
  show = true,
  engageCard,
  engaged,
  field,
  isOpponent,
  addToken,
  sendCardTo,
  tokensMap,
}: PropsCard) {
  const [swap, setSwap] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const z = useRef(0);
  const ref = useRef<HTMLDivElement>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<Point | null>(
    null
  );
  const [myPresence] = useMyPresence();
  const other = useOthers((others) =>
    others.find((o) => o.presence.lastPlayedCard)
  );
  const otherPlayedCard = other?.presence.lastPlayedCard;

  const isEngaged = engaged.find((c) => c === card.id);

  const hasToken = tokensMap[card.id] !== undefined;

  const index = swap ? 1 : 0;
  const bind = useGesture({
    onDragStart: () => {
      z.current = zIndex++;
    },
    onDrag: ({ offset: [x, y] }) => {
      const newX = Math.round(x / gridSize) * gridSize;
      const newY = Math.round(y / gridSize) * gridSize;
      setPosition({ x: newX, y: newY });
    },
    onContextMenu: ({ event }) => {
      if (!show || isOpponent) return;
      event.preventDefault();
      setContextMenuPosition({ x: event.pageX, y: event.pageY });
    },

    onDoubleClick: ({}) => {
      if (field === "battlefield" && !isOpponent)
        engageCard(card.id, !isEngaged);
      if (isOpponent) setSwap((prev) => !prev);
    },

    onDragEnd: ({ xy }) => {
      const containerDiv = document.getElementById("player_board");
      const rect = containerDiv?.getBoundingClientRect();
      const [x, y] = xy;
      if (
        rect &&
        (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) &&
        field !== "battlefield"
      ) {
        sendCardTo(field, "battlefield", card as any);
      }
    },
  });

  const handleContextMenuClose = () => {
    setContextMenuPosition(null);
  };

  const { lastPlayedCard } = myPresence;

  const isLastPlayed =
    (lastPlayedCard && card.id === lastPlayedCard) ||
    otherPlayedCard === card.id;
  let src = card;
  if (card.card_faces && card.card_faces.length > 0) {
    src = card.card_faces![index];
  }
  if (!show) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element*/}
        <img
          alt={"hidden card"}
          className="w-[180px] h-250px]"
          src="https://upload.wikimedia.org/wikipedia/en/thumb/a/aa/Magic_the_gathering-card_back.jpg/200px-Magic_the_gathering-card_back.jpg"
        />
      </>
    );
  }

  const transformStyle = `translate3d(${position.x}px, ${
    position.y
  }px, 0) rotate(${isEngaged ? 90 : 0}deg)`;

  return (
    <>
      <div
        ref={ref}
        style={{
          transform: transformStyle,
          touchAction: "none",
          zIndex: z.current,
          position: "relative",
          border: isLastPlayed ? "1px solid red" : "",
          pointerEvents: "all"
        }}
        {...bind()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element*/}
        <img
          draggable={false}
          loading="eager"
          className="w-[180px] h-250px]"
          src={src.image_uris?.normal}
          alt={src.name}
        ></img>
        {hasToken && (
          <div className="absolute top-8 right-4 bg-black rounded-full p-2 z-[99999]">{`${
            tokensMap[card.id][0]
          }/${tokensMap[card.id][1]}`}</div>
        )}
      </div>
      {!isOpponent && contextMenuPosition && (
        createPortal(<CustomContextMenu
          field={field}
          onEngaged={() => {
            engageCard(card.id, !isEngaged);
          }}
          onSwapped={() => {
            if (card.card_faces) setSwap((prev) => !prev);
          }}
          x={contextMenuPosition.x}
          y={contextMenuPosition.y}
          onClose={handleContextMenuClose}
          sendCardTo={sendCardTo}
          card={card as Datum}
          addToken={addToken}
        />, document.getElementsByTagName("body")[0]!)
      )}
    </>
  );
}
