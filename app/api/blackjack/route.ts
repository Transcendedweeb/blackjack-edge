export const runtime = "edge";

type Card = {
  suit: string;
  value: string;
};

const suits = ["♠", "♥", "♦", "♣"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function drawCard(): Card {
  return {
    suit: suits[Math.floor(Math.random() * suits.length)],
    value: values[Math.floor(Math.random() * values.length)],
  };
}

function handValue(hand: Card[]): number {
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.value === "A") {
      value += 11;
      aces++;
    } else if (["K", "Q", "J"].includes(card.value)) {
      value += 10;
    } else {
      value += Number(card.value);
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}

export async function POST(req: Request) {
  const body = await req.json();
  const action = body.action;

  let playerHand: Card[] = body.playerHand ?? [];
  let dealerHand: Card[] = body.dealerHand ?? [];

  if (action === "deal") {
    playerHand = [drawCard(), drawCard()];
    dealerHand = [drawCard(), drawCard()];
  }

  if (action === "hit") {
    playerHand = [...playerHand, drawCard()];
  }

  if (action === "stand") {
    while (handValue(dealerHand) < 17) {
      dealerHand.push(drawCard());
    }
  }

  return Response.json({
    playerHand,
    dealerHand,
    playerValue: handValue(playerHand),
    dealerValue: handValue(dealerHand),
  });
}