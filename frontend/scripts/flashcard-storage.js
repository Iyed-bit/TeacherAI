(() => {
  const storageKey = "teacherai-flashcard-decks";

  function readDecks() {
    const storedDecks = localStorage.getItem(storageKey);
    if (!storedDecks) {
      return [];
    }

    let decks;
    try {
      decks = JSON.parse(storedDecks);
    } catch {
      throw new Error("Saved flashcards could not be read. Clear the corrupted flashcard data to continue.");
    }

    if (!Array.isArray(decks) || !decks.every((deck) => (
      deck
      && typeof deck.id === "string"
      && typeof deck.topic === "string"
      && typeof deck.createdAt === "string"
      && Array.isArray(deck.cards)
      && deck.cards.every((card) => (
        card
        && typeof card.front === "string"
        && typeof card.back === "string"
        && typeof card.context === "string"
      ))
    ))) {
      throw new Error("Saved flashcards have an invalid format. Clear the corrupted flashcard data to continue.");
    }

    return decks;
  }

  function writeDecks(decks) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(decks));
    } catch (error) {
      if (error?.name === "QuotaExceededError") {
        throw new Error("Your browser storage is full. Delete an old flashcard deck and try again.");
      }
      throw error;
    }
  }

  function saveDeck(deck) {
    const decks = readDecks();
    decks.unshift(deck);
    writeDecks(decks);
  }

  function deleteDeck(deckId) {
    const decks = readDecks();
    writeDecks(decks.filter((deck) => deck.id !== deckId));
  }

  window.TeacherAI = window.TeacherAI || {};
  window.TeacherAI.flashcards = { deleteDeck, readDecks, saveDeck };
})();
