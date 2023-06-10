export function shuffle<T>(array: T[]) {
    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
}

function byteToHex(byte: number): string {
    return `0${byte.toString(16)}`.slice(-2);
}

export function generateRandomID() {
    const arr = new Uint8Array(10);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, byteToHex).join("");
}

export function processRawText(fromArena: string) {
    if (fromArena.trim() === "") return [];
    return new Set(
      fromArena
        .split("\n")
        .map((s) => {
          let withoutNumber = s.replace(/^[0-9]+/g, "").trim();
          if (withoutNumber.includes("//")) {
            //Double faced card
            return withoutNumber.split("//")[0].trim();
          }
          return withoutNumber;
        })
        .filter((s) => s !== "")
    );
  }
  
  export function processCardWithTheirAmount(cards: string) {
    const map = new Map<string, number>();
    for (const card of cards.split("\n")) {
      let [amount, ...cardName] = card.split(" ");
      if (cardName.includes("//")) {
        //Double faced card
        cardName = cardName.slice(
          0,
          cardName.findIndex((c) => c === "//")
        );
      }
      map.set(cardName.join(" ").toLowerCase().trim(), +amount);
    }
    return map;
  }