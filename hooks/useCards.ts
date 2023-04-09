import { CardCollection, Datum } from "@/types";
import { shuffle } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

const getCards = async (names: string[]) => {
    names = [...names];
    if (names.length <= 75) {
        return [await fetchCards(names)];
    }
    if (names.length > 200) {
        throw new Error("Too much cards")
    }

    const cardPromises = [];
    while (names.length) {
        const chunk = names.splice(0, 75).filter(Boolean);
        cardPromises.push(fetchCards(chunk));
    }

    const cardArrays = await Promise.all(cardPromises);
    return cardArrays.flat();
};

const fetchCards = async (names: string[]) => {
    const response = await fetch("https://api.scryfall.com/cards/collection", {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            identifiers: names.map((name) => ({ name })),
        }),
    });
    if (!response.ok) {
        throw new Error(await response.text())
    }

    return response.json();
};

function useCards(names: string[], onDataFetched: (data: Datum[]) => void) {
    // Queries
    return useQuery<CardCollection[], Error, Datum[]>({
        queryKey: ["decks", names],
        queryFn: () => getCards(names),
        onError: (err) => {
            console.error(err.message);
        },
        onSuccess: (data) => {
            onDataFetched(data);
        },
        staleTime: Number.POSITIVE_INFINITY,
        enabled: names.length > 0,
        refetchOnWindowFocus: false,
        select: useCallback((data: CardCollection[]) => {
            const cards = data.flatMap(d => d.data);
            return shuffle(cards);
        }, [])
    });
}

export default useCards;
