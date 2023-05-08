export function shuffle<T>(array: readonly T[]) {
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

