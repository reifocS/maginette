import { LiveList, LiveMap, LiveObject, createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";


type Presence = {
    lastPlayedCard: string | null,
    // ...
};

export type LiveCard = LiveObject<{
    id: string,
    name: string;
    card_faces?: LiveList<LiveCard>
    image_uris: LiveObject<{
        normal: string;
        large: string;
    }>;
    produced_mana?: string[];
}>;

type GameData = LiveObject<{
    deck: string[];
    allCards: LiveMap<string, LiveCard>;
    related: LiveList<LiveCard>;
    graveyard: string[];
    exile: string[];
    hand: string[];
    battlefield: string[][];
    engaged: LiveList<string>;
    tokens: LiveMap<string, [number, number]>;
    life: number;
    selected: string[];
}>

type Storage = {
    playerOne: GameData | null;
    playerTwo: GameData | null
};

const PUBLIC_API_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

// ============================================================================
if (!PUBLIC_API_KEY) {
    throw new Error(`You must add your Liveblocks public key to .env.local`);
}

const client = createClient({
    publicApiKey: PUBLIC_API_KEY,
});


export const {
    suspense: { RoomProvider, useStorage, useMutation, useUndo, useRoom, useCanRedo, useCanUndo, useRedo, useBatch, useMyPresence, useOthers, useHistory },
} = createRoomContext<Presence, Storage>(client);