// Core puzzle logic. Plain script so it runs in the browser and in node for tests.
(function (root) {
  "use strict";

  var ROUND_SECONDS = 60;
  var GREEN_COUNT = 2;
  var GRAY_COUNT = 5;
  var MIN_ANSWERS = 2;
  var MAX_ANSWERS = 8;
  var MAX_TOTAL = 14;

  function pick(arr, rng) {
    return arr[Math.floor(rng() * arr.length)];
  }

  function shuffle(arr, rng) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Does `word` satisfy the puzzle's green positions and excluded letters?
  function matches(word, puzzle) {
    for (var i = 0; i < puzzle.greens.length; i++) {
      var g = puzzle.greens[i];
      if (word[g.pos] !== g.letter) return false;
    }
    for (var k = 0; k < word.length; k++) {
      if (puzzle.grays.indexOf(word[k]) !== -1) return false;
    }
    return true;
  }

  function greensOnlyMatch(word, greens) {
    for (var i = 0; i < greens.length; i++) {
      if (word[greens[i].pos] !== greens[i].letter) return false;
    }
    return true;
  }

  // Build one puzzle: a target answer, two green letters, and five gray letters.
  // Gray letters are chosen from letters that appear in other words fitting the
  // green pattern, so they actually prune the space instead of being noise.
  function makePuzzle(words, rng) {
    rng = rng || Math.random;
    for (var attempt = 0; attempt < 200; attempt++) {
      var target = pick(words.answers, rng);
      var positions = shuffle([0, 1, 2, 3, 4], rng).slice(0, GREEN_COUNT).sort();
      var greens = positions.map(function (p) { return { pos: p, letter: target[p] }; });

      var candidates = words.answers.filter(function (w) { return greensOnlyMatch(w, greens); });
      var letterPool = {};
      candidates.forEach(function (w) {
        for (var i = 0; i < 5; i++) {
          if (target.indexOf(w[i]) === -1) letterPool[w[i]] = true;
        }
      });
      var grayChoices = shuffle(Object.keys(letterPool), rng);
      if (grayChoices.length < GRAY_COUNT) continue;
      var grays = grayChoices.slice(0, GRAY_COUNT).sort();

      var puzzle = { target: target, greens: greens, grays: grays };
      var answers = words.answers.filter(function (w) { return matches(w, puzzle); });
      if (answers.length < MIN_ANSWERS || answers.length > MAX_ANSWERS) continue;
      var allowed = words.allowed.filter(function (w) { return matches(w, puzzle); });
      if (answers.length + allowed.length > MAX_TOTAL) continue;

      puzzle.solutions = { answers: answers, allowed: allowed };
      return puzzle;
    }
    throw new Error("could not generate a puzzle");
  }

  // Judge a guess. `found` is the list of words already scored this round.
  function checkGuess(raw, puzzle, found) {
    var word = String(raw || "").toLowerCase().trim();
    if (word.length !== 5) return { ok: false, reason: "Five letters" };
    if (found.indexOf(word) !== -1) return { ok: false, reason: "Already found" };
    var isAnswer = puzzle.solutions.answers.indexOf(word) !== -1;
    var isAllowed = puzzle.solutions.allowed.indexOf(word) !== -1;
    if (!isAnswer && !isAllowed) {
      if (!matches(word, puzzle)) return { ok: false, reason: "Doesn't fit the pattern" };
      return { ok: false, reason: "Not in word list" };
    }
    return { ok: true, word: word, isAnswer: isAnswer, points: isAnswer ? 2 : 1 };
  }

  root.WordleGaps = {
    ROUND_SECONDS: ROUND_SECONDS,
    makePuzzle: makePuzzle,
    matches: matches,
    checkGuess: checkGuess
  };
})(typeof module !== "undefined" ? module.exports : window);
