# best-cooking-game-20261125-0137

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/A156413/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/A156413/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Golden Ladle — Hearth Kitchen Rush: a complete timed cooking game that runs in a desktop browser from static files, with no network requests. Read the order board, click ingredients (or press keys 1–8) onto the assembly plate, cook dishes on the stove, and ring the bell to serve before customers lose patience. A 150-second shift, six original dishes, combos, coins and a three-star shift report.

## Run it

```sh
python3 -m http.server --directory game 8080
# then open http://localhost:8080 in desktop Chrome
```

Or serve `game/` with any static file server and open `index.html`. Play with mouse and keyboard: click an ingredient bin or press 1–8 to add it, Space rings the bell to serve, X trashes the plate, P pauses, R restarts, Enter starts.

Screenshots are real renders of the game's own code (`game/src/shots.js` stages each scene with `?shot=start|play|serve|end`).

---

<sub>Entered on [make.fun](https://make.fun/?ref=vr99z7h1&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
