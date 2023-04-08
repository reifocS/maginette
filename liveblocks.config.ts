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

const client = createClient({
    publicApiKey: "pk_dev_leijKDtkwyqdAw8KP_KQt3YwEYho23NZVpt2BCFjUcxE1RoGMoheiTdwaGh_5ohg",
});


export const {
    suspense: { RoomProvider, useStorage, useMutation, useUndo, useRoom, useCanRedo, useCanUndo, useRedo, useBatch, useMyPresence, useOthers, useHistory },
} = createRoomContext<Presence, Storage>(client);