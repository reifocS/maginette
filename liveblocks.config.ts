import { LiveList, LiveMap, LiveObject, createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";


type Presence = {
    lastPlayedCard: string | null,
    // ...
};

type LiveCard = LiveObject<{
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
    deck: LiveList<LiveCard>;
    related: LiveList<LiveCard>;
    graveyard: LiveList<LiveCard>;
    exile: LiveList<LiveCard>;
    hand: LiveList<LiveCard>;
    battlefield: LiveList<LiveCard>;
    engaged: LiveList<string>;
    tokens: LiveMap<string, [number, number]>;
    life: number;
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