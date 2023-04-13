import { Datum, Fields, OpponentCard, Point } from "@/types";
import { useGesture } from "@use-gesture/react";
import { useState, useRef } from "react";
import CustomContextMenu from "./ContextMenu";
import { useMyPresence, useOthers } from "@/liveblocks.config";
import { createPortal } from "react-dom";

type PropsCard = {
  card: Datum | OpponentCard;
  overrideZindex?: number;
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
  ctrlKey: boolean;
  setSelection?: (cardId: string) => void;
  cardSelection?: string[];
};

const gridSize = 30;
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
  ctrlKey,
  overrideZindex,
  cardSelection = [],
  setSelection = () => {},
}: PropsCard) {
  const [swap, setSwap] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHover, setIsHover] = useState(false);
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
      setIsDragging(true);
    },
    onDragEnd: () => {
      setIsDragging(false);
    },
    onHover: () => {
      setIsHover(true);
    },
    onMouseLeave: () => {
      setIsHover(false);
    },
    onDrag: ({ offset: [x, y], xy }) => {
      const newX = Math.round(x / gridSize) * gridSize;
      const newY = Math.round(y / gridSize) * gridSize;
      setPosition({ x: newX, y: newY });
    },
    onContextMenu: ({ event }) => {
      if (!show || isOpponent) return;
      event.preventDefault();
      setContextMenuPosition({ x: event.pageX, y: event.pageY });
    },

    onClick: ({ shiftKey, ctrlKey, altKey }) => {
      // Shortcuts
      if (field === "battlefield" && !isOpponent && shiftKey && altKey) {
        return setSelection(card.id);
      }
      if (field === "battlefield" && !isOpponent && shiftKey)
        engageCard(card.id, !isEngaged);
      if (isOpponent) setSwap((prev) => !prev);
      if (field === "battlefield" && !isOpponent && ctrlKey) {
        sendCardTo(field, "graveyard", card as any);
      }
      if (field === "battlefield" && !isOpponent && altKey) {
        sendCardTo(field, "exile", card as any);
      }
      if (field === "hand" && !isOpponent && shiftKey) {
        sendCardTo(field, "battlefield", card as any);
      }
      if (field === "tokens" && !isOpponent && shiftKey) {
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
          className="w-[120px] h-[165px] rounded-lg overflow-hidden"
          src="https://upload.wikimedia.org/wikipedia/en/thumb/a/aa/Magic_the_gathering-card_back.jpg/200px-Magic_the_gathering-card_back.jpg"
        />
      </>
    );
  }

  const transformStyle = `translate3d(${position.x}px, ${
    position.y
  }px, 0) rotate(${isEngaged ? 90 : 0}deg)`;

  const cardSize =
    field === "hand" && !isOpponent
      ? "w-[180px] h-[257px]"
      : "w-[150px] h-[214px]";

  const isFromSelection = cardSelection.find((id) => id === card.id);
  return (
    <>
      {isHover &&
        ctrlKey &&
        createPortal(
          <div
            className="fixed top-4 right-0 z-[9999]"
            style={{
              pointerEvents: "none",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              draggable={false}
              loading="eager"
              className="h-[50%] rounded-3xl overflow-hidden"
              src={src.image_uris?.normal}
              alt={src.name}
            ></img>
          </div>,
          document.getElementsByTagName("body")[0]
        )}
      <div
        ref={ref}
        className="card rounded-lg overflow-hidden"
        style={{
          transform: transformStyle,
          touchAction: "none",
          opacity: isFromSelection ? 0.5 : 1,
          zIndex: isDragging ? 9999 : isEngaged ? 0 : overrideZindex ?? 1,
          position: "relative",
          boxShadow: isLastPlayed
            ? "0px 0px 10px rgba(255, 255, 255, 0.8), 0px 0px 10px rgba(255, 255, 255, 0.6), 0px 0px 10px rgba(255, 255, 255, 0.4)"
            : "",
        }}
        {...bind()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element*/}
        <img
          draggable={false}
          loading="eager"
          className={`${cardSize}`}
          src={src.image_uris?.normal}
          alt={src.name}
        ></img>
        {hasToken && (
          <div className="absolute top-8 right-4 text-white bg-black rounded-full p-2 z-[99999]">{`${
            tokensMap[card.id][0]
          }/${tokensMap[card.id][1]}`}</div>
        )}
      </div>
      {!isOpponent && contextMenuPosition && (
        <CustomContextMenu
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
          currentTokenValue={tokensMap[card.id]}
          addToSelection={() => {
            if (field === "battlefield" && !isOpponent) {
              setSelection(card.id);
            }
          }}
        />
      )}
    </>
  );
}
