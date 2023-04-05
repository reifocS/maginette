import { LiveList, LiveObject } from "@liveblocks/client";
import { ClientSideSuspense } from "@liveblocks/react";
import { useRouter } from "next/router";
import { RoomProvider } from "../../liveblocks.config";
import FullBoard from "@/components/FullBoard";
import useCards from "@/hooks/useCards";
import { useMemo } from "react";

const Game = () => {
  const router = useRouter();
  const { room, player } = router.query;

  if (!room) {
    // useRouter is not accessible before hydration.
    return null;
  }

  return (
    <RoomProvider
      id={room as string}
      initialStorage={{
        playerOne: null,
        playerTwo: null,
      }}
      initialPresence={{ lastPlayedCard: null }}
    >
      <ClientSideSuspense
        fallback={
          <div
            style={{
              color: "black",
              fontWeight: 600,
              height: "100vh",
              width: "100vw",
              backgroundColor: "#87ceeb",
            }}
          >
            Loading...
          </div>
        }
      >
        {() => <FullBoard player={Number(player)} />}
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default Game;
