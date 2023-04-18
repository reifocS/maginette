import { CardCollection, Datum } from "@/types";
import { shuffle } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";

const getCards = async (names: string[]) => {
    names = [...names];
    if (names.length <= 75) {
        return [await fetchCards(names)];
    }
    if (names.length > 200) {
        throw new Error("Too much cards");
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
        throw new Error(await response.text());
    }

    return response.json();
};

function useCards(names: string[], onDataFetched: (data: Datum[]) => void) {
    // Queries
    return useQuery<CardCollection[], Error, Datum[]>({
        queryKey: ["decks", names],
        queryFn: () => getCards(names),
        useErrorBoundary: true,
        onError: (err) => {
            console.error(err.message);
            toast.error("Failed to fetch deck");
        },
        onSuccess: (data) => {
            onDataFetched(data);
        },
        enabled: names.length > 0,
        structuralSharing: false, 
        refetchOnWindowFocus: false,
        select: useCallback((data: CardCollection[]) => {
            const cards = data.flatMap((d) => d.data);
            for (const d of data) {
                if (d.not_found && d.not_found.length > 0) {
                    toast(
                        `${d.not_found
                            .map((not_found) => not_found.name)
                            .join(", ")} not found`
                    );
                }
            }
            return shuffle(cards);
        }, []),
    });
}

export default useCards;
