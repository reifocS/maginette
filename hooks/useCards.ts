import { CardCollection } from "@/types";
import { useQuery } from "@tanstack/react-query";

const getCards = async (names: string[]) => {
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

function useCards(names: string[]) {
    // Queries
    return useQuery<CardCollection, Error>({
        queryKey: ["decks", names],
        queryFn: () => getCards(names),
        onError: (err) => {
            console.error(err.message);
        },
        enabled: names.length > 0
    });
}

export default useCards;
