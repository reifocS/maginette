import { Fields, Datum } from "@/types";
import { useRef, useEffect, Fragment, useState } from "react";

export const fields: Fields[] = [
  "battlefield",
  "graveyard",
  "exile",
  "hand",
  "deck",
  "tokens",
];

type ContextMenuProps = {
  x: number;
  y: number;
  onClose: () => void;
  field: Fields;
  onEngaged: () => void;
  onSwapped: () => void;
  sendCardTo(from: Fields, to: Fields, card: Datum, payload?: any): void;
  card: Datum;
  addToken: (cardId: string, [power, thougness]: [number, number]) => void;
  currentTokenValue?: [number, number];
};

const CustomContextMenu = ({
  x,
  y,
  onClose,
  field,
  onEngaged,
  onSwapped,
  sendCardTo,
  card,
  addToken,
  currentTokenValue,
}: ContextMenuProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [power, setPower] = useState(
    currentTokenValue ? currentTokenValue[0] : 0
  );
  const [thougness, setToughness] = useState(
    currentTokenValue ? currentTokenValue[1] : 0
  );
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const className = "p-1 cursor-pointer hover:bg-slate-500";

  return (
    <div
      className="bg-slate-800 p-3"
      ref={ref}
      style={{
        position: "absolute",
        top: y,
        left: x,
        zIndex: 9999,
      }}
    >
      <ul className="flex flex-col">
        {fields
          .filter((f) => f !== field && f !== "tokens")
          .map((f) => {
            if (f === "deck") {
              return (
                <Fragment key={f}>
                  <li
                    className={className}
                    onClick={() => {
                      sendCardTo(field, f, card, { position: "top" });
                    }}
                  >
                    Send to top of {f}
                  </li>
                  <li
                    className={className}
                    onClick={() => {
                      sendCardTo(field, f, card, { position: "bottom" });
                    }}
                  >
                    Send to bottom of {f}
                  </li>
                </Fragment>
              );
            }
            return (
              <li
                className={className}
                key={f}
                onClick={() => {
                  sendCardTo(field, f, card);
                }}
              >
                Send to {f}
              </li>
            );
          })}
        <li className={className} onClick={onEngaged}>
          Engage/Desengage
        </li>
        <li className={className} onClick={onSwapped}>
          Swap face
        </li>
        <li
          className={className}
          onClick={() => {
            window.open(card.image_uris.normal);
          }}
        >
          Show card in another window
        </li>
        <li
          className={className}
          onClick={() => {
            addToken(card.id, [power, thougness]);
          }}
        >
          Add token +
          <input
            type="number"
            className="w-[30px]"
            value={power}
            onChange={(e) => setPower(+e.target.value)}
            placeholder="x"
          ></input>
          /+
          <input
            type="number"
            className="w-[30px]"
            value={thougness}
            onChange={(e) => setToughness(+e.target.value)}
            placeholder="x"
          ></input>
        </li>
      </ul>
    </div>
  );
};

export default CustomContextMenu;
