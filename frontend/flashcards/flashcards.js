const deckTotal = document.getElementById("deck-total");
const storageError = document.getElementById("storage-error");
const emptyState = document.getElementById("empty-state");
const deckLayout = document.getElementById("deck-layout");
const deckList = document.getElementById("deck-list");
const flashcard = document.getElementById("flashcard");
const flashcardFront = document.getElementById("flashcard-front");
const flashcardContext = document.getElementById("flashcard-context");
const cardSideLabel = document.getElementById("card-side-label");
const flipHint = document.getElementById("flip-hint");
const cardPosition = document.getElementById("card-position");
const knownCount = document.getElementById("known-count");
const previousButton = document.getElementById("previous-card");
const nextButton = document.getElementById("next-card");
const markKnownButton = document.getElementById("mark-known");

let decks = [];
let activeDeckId = null;
let cardIndex = 0;
let isRevealed = false;
let knownCardIds = new Set();

function getActiveDeck() {
  return decks.find((deck) => deck.id === activeDeckId);
}

function renderDeckList() {
  deckList.replaceChildren();
  decks.forEach((deck) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "deck-choice";
    button.classList.toggle("is-active", deck.id === activeDeckId);
    button.setAttribute("aria-pressed", String(deck.id === activeDeckId));
    const title = document.createElement("span");
    title.className = "deck-choice-title";
    title.textContent = deck.topic;
    const details = document.createElement("span");
    details.className = "deck-choice-details";
    details.textContent = `${deck.cards.length} ${deck.cards.length === 1 ? "card" : "cards"} · ${new Date(deck.createdAt).toLocaleDateString()}`;
    button.append(title, details);
    button.addEventListener("click", () => {
      activeDeckId = deck.id;
      cardIndex = 0;
      knownCardIds = new Set();
      render();
    });
    deckList.append(button);
  });
}

function renderCard() {
  const deck = getActiveDeck();
  if (!deck) {
    return;
  }
  const card = deck.cards[cardIndex];
  flashcard.classList.toggle("is-revealed", isRevealed);
  flashcard.setAttribute("aria-label", isRevealed ? "Flashcard answer. Activate to see the key idea." : "Flashcard key idea. Activate to reveal the answer.");
  cardSideLabel.textContent = isRevealed ? "THE IDEA" : "KEY IDEA · TAP TO REVEAL";
  flashcardFront.textContent = isRevealed ? card.back : card.front;
  flashcardContext.textContent = isRevealed ? `From your quiz: ${card.context}` : card.context;
  flipHint.textContent = isRevealed ? "↻ Tap card to see the key idea" : "↻ Tap card to reveal answer";
  cardPosition.textContent = `CARD ${String(cardIndex + 1).padStart(2, "0")} / ${String(deck.cards.length).padStart(2, "0")}`;
  knownCount.textContent = `${knownCardIds.size} of ${deck.cards.length} marked known`;
  previousButton.disabled = deck.cards.length < 2;
  nextButton.disabled = deck.cards.length < 2;
  markKnownButton.disabled = !isRevealed;
  markKnownButton.classList.toggle("is-known", knownCardIds.has(`${deck.id}:${cardIndex}`));
  markKnownButton.textContent = knownCardIds.has(`${deck.id}:${cardIndex}`) ? "Known ✓" : "I know this ✓";
}

function render() {
  deckTotal.textContent = `${decks.length} ${decks.length === 1 ? "deck" : "decks"}`;
  emptyState.hidden = decks.length > 0;
  deckLayout.hidden = decks.length === 0;
  if (decks.length === 0) {
    deckList.replaceChildren();
    return;
  }

  if (!decks.some((deck) => deck.id === activeDeckId)) {
    activeDeckId = decks[0].id;
  }
  renderDeckList();
  const deck = getActiveDeck();
  document.getElementById("active-deck-title").textContent = deck.topic;
  renderCard();
}

function setRevealState(revealed) {
  isRevealed = revealed;
  renderCard();
}

function loadDecks() {
  try {
    decks = window.TeacherAI.flashcards.readDecks();
    render();
  } catch (error) {
    storageError.textContent = error.message || "Could not load saved flashcards.";
    storageError.hidden = false;
    deckTotal.textContent = "Unavailable";
    emptyState.hidden = true;
    deckLayout.hidden = true;
  }
}

flashcard.addEventListener("click", () => setRevealState(!isRevealed));
previousButton.addEventListener("click", () => {
  const deck = getActiveDeck();
  if (!deck || deck.cards.length < 2) {
    return;
  }
  cardIndex = (cardIndex - 1 + deck.cards.length) % deck.cards.length;
  setRevealState(false);
});
nextButton.addEventListener("click", () => {
  const deck = getActiveDeck();
  if (!deck || deck.cards.length < 2) {
    return;
  }
  cardIndex = (cardIndex + 1) % deck.cards.length;
  setRevealState(false);
});
markKnownButton.addEventListener("click", () => {
  if (!isRevealed) {
    return;
  }
  const key = `${activeDeckId}:${cardIndex}`;
  if (knownCardIds.has(key)) {
    knownCardIds.delete(key);
  } else {
    knownCardIds.add(key);
  }
  renderCard();
});
document.getElementById("shuffle-cards").addEventListener("click", () => {
  const deck = getActiveDeck();
  if (!deck || deck.cards.length < 2) {
    return;
  }
  for (let index = deck.cards.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [deck.cards[index], deck.cards[swapIndex]] = [deck.cards[swapIndex], deck.cards[index]];
  }
  cardIndex = 0;
  knownCardIds = new Set();
  setRevealState(false);
});
document.getElementById("delete-deck").addEventListener("click", () => {
  const deck = getActiveDeck();
  if (!deck || !window.confirm(`Delete the “${deck.topic}” flashcard deck? This cannot be undone.`)) {
    return;
  }
  try {
    window.TeacherAI.flashcards.deleteDeck(deck.id);
    decks = window.TeacherAI.flashcards.readDecks();
    activeDeckId = null;
    cardIndex = 0;
    knownCardIds = new Set();
    render();
  } catch (error) {
    storageError.textContent = error.message || "Could not delete this flashcard deck.";
    storageError.hidden = false;
  }
});

loadDecks();
