import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import { ClientSideSuspense } from "@liveblocks/react";
import { useRouter } from "next/router";
import { RoomProvider } from "../../liveblocks.config";
import FullBoard from "@/components/FullBoard";

const Game = () => {
  const router = useRouter();
  const { room, player } = router.query;

  if (!room) {
    // useRouter is not accessible before hydration.
    return null;
  }
  //type GameData = LiveObject<{
  //   deck: LiveList<LiveCard>;
  //   related: LiveList<LiveCard>;
  //   graveyard: LiveList<LiveCard>;
  //   exile: LiveList<LiveCard>;
  //   hand: LiveList<LiveCard>;
  //   battlefield: LiveList<LiveCard>;
  //   engaged: LiveList<string>;
  //   tokens: LiveMap<string, [number, number]>;
  //   life: number;
  // }>
  return (
    <RoomProvider
      id={room as string}
      initialStorage={{
        playerOne: new LiveObject({
          tokens: new LiveMap(),
          deck: new LiveList(),
          graveyard: new LiveList(),
          exile: new LiveList(),
          engaged: new LiveList(),
          battlefield: new LiveList(),
          life: 20,
          related: new LiveList(),
          hand: new LiveList(),
        }),
        playerTwo: new LiveObject({
          tokens: new LiveMap(),
          deck: new LiveList(),
          graveyard: new LiveList(),
          exile: new LiveList(),
          engaged: new LiveList(),
          battlefield: new LiveList(),
          life: 20,
          related: new LiveList(),
          hand: new LiveList(),
        }),
      }}
      initialPresence={{ lastPlayedCard: null }}
    >
      <ClientSideSuspense
        fallback={
          <div
            style={{
              fontWeight: 600,
              height: "100vh",
              width: "100vw",
            }}
          >
            Preparing your deck...
          </div>
        }
      >
        {() => <FullBoard player={Number(player)} />}
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default Game;
