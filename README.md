# vrdl

A 20-second drill for the odd five-letter words that make Wordle hard.

Play it: https://feoh.github.io/vrdl/

Each round shows two green letters and five letters that are *not* in the
word. Type every valid five-letter word that fits before the timer runs out.
Words from the real Wordle answer list score 2 points, other valid guesses
score 1. When time is up you see everything you missed, which is where the
learning happens.

## Running locally

It is a single static page with no build step.

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000/. Opening `index.html` directly also works.

## Tests

```sh
node test.js
```

## Word lists

`words.js` bundles the original Wordle answer list (plus a few later NYT
additions, like "parch") and the allowed-guess list. Regenerate it from
`answers.txt` and `allowed.txt` style files if the lists change.

## License

MIT. See `LICENSE`.
