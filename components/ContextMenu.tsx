import { Fields, Datum } from "@/types";
import { useRef, useEffect, Fragment } from "react";

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
}: ContextMenuProps) => {
  const ref = useRef<HTMLDivElement>(null);

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
      </ul>
    </div>
  );
};

export default CustomContextMenu;
