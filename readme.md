# Brain Rot Slots

## Overview
Brain Rot Slots is a simple web-based slot machine game. The game allows users to place bets, spin the slots, and win or lose coins based on the outcome. The game also keeps track of the results and displays them in a paginated table.

## Features
- Slot machine with three slots
- Betting system with adjustable bet amounts
- Coin balance tracking
- Win and loss messages
- Sound effects for wins
- Result history stored in IndexedDB
- Pagination for result history

## Files
- `index.html`: The main HTML file for the game.
- `manifest.json`: The web app manifest file.
- `7.png`, `mango.jpg`, `cherry.webp`, `gyat.png`, `bell.webp`, `sks.webp`, `cat.jpg`: Images used in the slot machine.
- `win.mp3`: Sound effect played when the user wins.

## How to Play
1. Open `index.html` in a web browser.
2. Adjust the bet amount using the input field.
3. Click the "Roll" button to spin the slots.
4. If you win, the corresponding amount of coins will be added to your balance.
5. If you lose, the bet amount will be deducted from your balance.
6. The result of each spin will be recorded and displayed in the result history table.
7. Use the "Previous" and "Next" buttons to navigate through the result history.

## Resetting the Game
- Click the "Reset" button to reset the coin balance to the initial amount.

## License
This project is licensed under the MIT License.