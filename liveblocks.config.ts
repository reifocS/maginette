import { LiveList, LiveMap, LiveObject, createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import { Datum, CardFromLiveList } from "./types";


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

export type GameDataLive = LiveObject<GameData>
export type GameData = {
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
    swapped: string[];
}
type Storage = {
    playerOne: GameDataLive | null;
    playerTwo: GameDataLive | null
};

const PUBLIC_API_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

// ============================================================================
if (!PUBLIC_API_KEY) {
    throw new Error(`You must add your Liveblocks public key to .env.local`);
}

const client = createClient({
    publicApiKey: PUBLIC_API_KEY,
});


export function datumToLiveCard(d: Datum) {
    return new LiveObject({
        id: d.id,
        name: d.name,
        image_uris: new LiveObject({
            normal: d.image_uris?.normal,
            large: d.image_uris?.large,
        }),
        produced_mana: (d as Datum).produced_mana,
        card_faces: new LiveList(
            d.card_faces?.map((cf) => {
                return new LiveObject({
                    name: cf.name,
                    id: cf.id,
                    image_uris: new LiveObject({
                        normal: cf.image_uris?.normal,
                        large: cf.image_uris?.large,
                    }),
                    produced_mana: cf.produced_mana,
                });
            })
        ),
    });
}

export function dataToLiveList(data?: Datum[] | CardFromLiveList) {
    return new LiveList(
        data?.map((d) => {
            return new LiveObject({
                id: d.id,
                name: d.name,
                image_uris: new LiveObject({
                    normal: d.image_uris?.normal,
                    large: d.image_uris?.large,
                }),
                produced_mana: (d as Datum).produced_mana,
                card_faces: new LiveList(
                    d.card_faces?.map((cf) => {
                        return new LiveObject({
                            name: cf.name,
                            id: cf.id,
                            image_uris: new LiveObject({
                                normal: cf.image_uris?.normal,
                                large: cf.image_uris?.large,
                            }),
                            produced_mana: cf.produced_mana,
                        });
                    })
                ),
            });
        })
    );
}

export const {
    suspense: { RoomProvider, useStorage, useMutation, useUndo, useRoom, useCanRedo, useCanUndo, useRedo, useBatch, useMyPresence, useOthers, useHistory },
} = createRoomContext<Presence, Storage>(client);