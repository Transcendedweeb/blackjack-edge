"use client";

import { useState } from "react";

type Card = {
  suit: string;
  value: string;
};

type GameStatus =
  | "waiting"
  | "playing"
  | "player_blackjack"
  | "player_bust"
  | "dealer_bust"
  | "player_win"
  | "dealer_win"
  | "push";

export default function Home() {
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [playerValue, setPlayerValue] = useState<number | null>(null);
  const [dealerValue, setDealerValue] = useState<number | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");

  async function play(action?: "deal" | "hit" | "stand") {
    if (action === "hit" && gameStatus !== "playing") return;
    if (action === "stand" && gameStatus !== "playing") return;

    const res = await fetch("/api/blackjack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerHand,
        dealerHand,
        action,
      }),
    });

    const data = await res.json();

    setPlayerHand(data.playerHand);
    setDealerHand(data.dealerHand);
    setPlayerValue(data.playerValue);
    setDealerValue(data.dealerValue);

    if (action === "deal") {
      setGameStatus("playing");
      if (data.playerValue === 21) {
        setGameStatus("player_blackjack");
      }
    } else if (action === "hit") {
      if (data.playerValue > 21) {
        setGameStatus("player_bust");
      }
    } else if (action === "stand") {
      if (data.dealerValue > 21) {
        setGameStatus("dealer_bust");
      } else if (data.dealerValue > data.playerValue) {
        setGameStatus("dealer_win");
      } else if (data.dealerValue < data.playerValue) {
        setGameStatus("player_win");
      } else {
        setGameStatus("push");
      }
    }
  }

  function getStatusMessage(): string {
    switch (gameStatus) {
      case "waiting":
        return "Klik op Deal om te beginnen.";
      case "playing":
        return "Speel je zet.";
      case "player_blackjack":
        return "Blackjack! Je wint!";
      case "player_bust":
        return "Bust! Dealer wint.";
      case "dealer_bust":
        return "Dealer bust! Je wint!";
      case "player_win":
        return "Je wint!";
      case "dealer_win":
        return "Dealer wint.";
      case "push":
        return "Gelijkspel.";
      default:
        return "";
    }
  }

  return (
    <main className="w-screen h-screen bg-gray flex items-center justify-center">
      <div className="bg-zinc-900 text-white rounded-xl p-6 flex flex-col items-center gap-6 width-50vw max-w-md">
        <h1 className="text-3xl font-bold text-center">Blackjack</h1>

        <p className="text-lg text-center">{getStatusMessage()}</p>

        <div className="flex gap-4">
          <button
            onClick={() => play("deal")}
            disabled={gameStatus === "playing"}
            className="rounded bg-black text-white px-6 py-3 disabled:opacity-50"
          >
            Deal
          </button>
          <button
            onClick={() => play("hit")}
            disabled={gameStatus !== "playing"}
            className="rounded bg-blue-600 text-white px-6 py-3 disabled:opacity-50"
          >
            Hit
          </button>
          <button
            onClick={() => play("stand")}
            disabled={gameStatus !== "playing"}
            className="rounded bg-green-600 text-white px-6 py-3 disabled:opacity-50"
          >
            Stand
          </button>
        </div>

        <div className="flex flex-col gap-4 w-full items-center">
          <div>
            <h2 className="font-semibold text-center mb-2">
              Player ({playerValue ?? 0})
            </h2>
            <div className="flex gap-4 justify-center">
              {playerHand.map((card, i) => (
                <div
                  key={i}
                  className="bg-white text-black rounded-lg p-5 shadow-lg flex items-center justify-center text-xl"
                >
                  {card.value}
                  {card.suit}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-center mb-2">
              Dealer ({gameStatus === "playing" ? "?" : dealerValue ?? 0})
            </h2>
            <div className="flex gap-4 justify-center">
              {dealerHand
                .slice(0, gameStatus === "playing" ? 1 : dealerHand.length)
                .map((card, i) => (
                  <div
                    key={i}
                    className="bg-white text-black rounded-lg p-5 shadow-lg flex items-center justify-center text-xl"
                  >
                    {card.value}
                    {card.suit}
                  </div>
                ))}
              {gameStatus === "playing" && dealerHand.length > 1 && (
                <div className="bg-white text-black rounded-lg p-5 shadow-lg flex items-center justify-center text-xl">
                  🂠
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
