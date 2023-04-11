import { generateRandomID } from "@/utils";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Maginette</title>
        <meta name="description" content="Magic the gathering online game" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col h-full text-center p-10">
        <h1 className="font-bold text-5xl underline">Maginette</h1>

        <div className="p-5 m-auto">
          <form
            className="flex flex-col grow-0 items-center content-center"
            onSubmit={(e) => {
              e.preventDefault();
              router.push({
                pathname: "/game",
                query: {
                  room: generateRandomID(),
                  player: 0,
                },
              });
            }}
          >
            <button className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">
              Create room
            </button>
          </form>

          <p className="p-3">OR</p>

          <form
            className={`${"flex flex-col grow-0 items-center content-center"}`}
            onSubmit={(e) => {
              e.preventDefault();
              const target = e.target as typeof e.target & {
                room: { value: string };
              };
              router.push({
                pathname: "/game",
                query: {
                  room: target.room.value,
                  player: 1,
                },
              });
            }}
          >
            <div className="flex gap-2">
              <button className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">
                Join
              </button>
              <input
                id="room"
                placeholder="room id"
                className="px-3"
                required
              ></input>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
