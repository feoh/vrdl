// Smoke test for the puzzle logic. Run with: node test.js
"use strict";
var assert = require("assert");
var WORDS = require("./words.js");
var G = require("./logic.js").WordleGaps;

// Deterministic RNG so failures are reproducible.
function seeded(seed) {
  return function () {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

var rng = seeded(42);
for (var i = 0; i < 300; i++) {
  var p = G.makePuzzle(WORDS, rng);
  assert.strictEqual(p.greens.length, 2, "two greens");
  assert.strictEqual(p.grays.length, 5, "five grays");
  assert.ok(G.matches(p.target, p), "target fits its own puzzle");
  assert.ok(p.solutions.answers.indexOf(p.target) !== -1, "target is among answers");
  assert.ok(p.solutions.answers.length >= 2 && p.solutions.answers.length <= 8, "answer count in range");
  p.grays.forEach(function (l) { assert.ok(p.target.indexOf(l) === -1, "gray not in target"); });
  p.solutions.answers.concat(p.solutions.allowed).forEach(function (w) {
    assert.ok(G.matches(w, p), "solution " + w + " fits");
  });
}

// Guess checking against a hand-built puzzle.
var fixed = {
  greens: [{ pos: 1, letter: "a" }, { pos: 4, letter: "h" }],
  grays: ["e", "i", "o", "u", "s"],
  solutions: { answers: ["parch", "match"], allowed: ["natch"] }
};
assert.deepStrictEqual(G.checkGuess("PARCH", fixed, []).points, 2);
assert.deepStrictEqual(G.checkGuess("natch", fixed, []).points, 1);
assert.strictEqual(G.checkGuess("parch", fixed, ["parch"]).reason, "Already found");
assert.strictEqual(G.checkGuess("par", fixed, []).reason, "Five letters");
assert.strictEqual(G.checkGuess("sarah", fixed, []).reason, "Doesn't fit the pattern");
assert.strictEqual(G.checkGuess("zarch", fixed, []).reason, "Not in word list");

assert.ok(WORDS.answers.indexOf("parch") !== -1, "parch is in the answer list");
assert.ok(WORDS.answers.length > 2000 && WORDS.allowed.length > 10000, "word lists loaded");

console.log("ok: 300 puzzles generated, guess checks pass");
