import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import { ClientSideSuspense } from "@liveblocks/react";
import { useRouter } from "next/router";
import { RoomProvider } from "../../liveblocks.config";
import FullBoard from "@/components/FullBoard";
import Loading from "@/components/Loading";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/ErrorFallback";

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
          allCards: new LiveMap(),
          tokens: new LiveMap(),
          deck: [],
          graveyard: [],
          exile: [],
          engaged: new LiveList(),
          battlefield: [],
          life: 20,
          related: new LiveList(),
          hand: [],
          selected: [],
        }),
        playerTwo: new LiveObject({
          allCards: new LiveMap(),
          tokens: new LiveMap(),
          deck: [],
          graveyard: [],
          exile: [],
          engaged: new LiveList(),
          battlefield: [],
          life: 20,
          related: new LiveList(),
          hand: [],
          selected: [],
        }),
      }}
      initialPresence={{ lastPlayedCard: null }}
    >
      <ClientSideSuspense fallback={<Loading />}>
        {() => (
          <ErrorBoundary fallback={<ErrorFallback />}>
            <FullBoard player={Number(player)} />
          </ErrorBoundary>
        )}
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default Game;
