# Orbit Game

Step onto the virtual campaign trail in our web-based political showdown! In this engaging game, you'll dive headfirst into the thrilling world of election campaigns, where strategy and influence reign supreme. As a political strategist, you'll choose to align with either the dynamic Red party or the formidable Blue party, each vying for the hearts and minds of the electorate.

With just three intense rounds, each lasting a mere 45 seconds, the race is on! Who will emerge victorious with the largest number of voters trapped within their nets? It's a political battle of wits and tactics that will keep you on the edge of your seat. So, rally your party, harness your strategic prowess, and let the campaign games begin!

## Developer

### Scoring Logic

There are 3 "POLL_TOPIC"s for now.  
https://github.com/amitlzkpa/orbit-game/blob/master/js/GameObjects.js#L18-L20

Voter decides to join or not join based on their POLL_TOPIC preferences.  
In limbo; each voter decides if they're gonna join on not based on following calculation:

For each poll topic:

- multiply voter preference for that topic with the party's budget allocation for that topic
  eg: if voter preference is 0.4(40%) and party's budget is 0.7(70%); a score of 0.28 is calculated for that POLL_TOPIC
- sum up such scores of all POLL_TOPICS
  - the max this score can go is 1.00 [(0.9999~) => (0.33 * 1.0 + 0.33 * 1.0 + 0.33 * 1.0)]
- if the total of scores is greater than 0.7(70%); the voter joins

https://github.com/amitlzkpa/orbit-game/blob/master/js/App.js#L444-L465

Blue party spawns with fixed POLL_TOPIC budget allocation (totals to 1)  
https://github.com/amitlzkpa/orbit-game/blob/master/js/App.js#L340-L344

Red party spawns with similar fixed POLL_TOPIC allocations (totals to 1)  
https://github.com/amitlzkpa/orbit-game/blob/master/js/App.js#L384-L388

Voter spawns with random preferences for POLL_TOPIC (ranges between 0.1-1.0). Does not toal to 1. Each expresses preferences of voter from 0.1 (low preference) to 1.0 (high preferences) for that POLL_TOPIC.  
https://github.com/amitlzkpa/orbit-game/blob/master/js/App.js#L550-L560

### Voter Spawning Logic

2 parties spawn around center of screen.  
Voters spawn around edges of screen.

Only applies to freeVoters (i.e. not in limbo, nor orbiting)

- If any outside board (10% buffer) ==> remove them
- If any intersecting with parties; put them in limbo (they sink slowly to party center)
- Count all freeVoters on board; if less than max freeVoters; spawn more (max - freevoter) around edges

## Rounds

### Game manager

- Setup parties
  Show bills

Collect round stats
Show user pref picker
Calculate scores
assign rewards

#### Flow

Show rounnd intro UI
launch Game
wait for it to finish
Show round end UI
Loop x3
Show result

## ToDo

- [ ] need to connect with organizer resources.
- [ ] need graphics which communicate underlying prefs.
- [ ] need UI to allow player to control their player.
- [ ] need logic for rounds and deciding winner.
- [ ] need explainer.

## Cheat Mode

use `FRIENDS` as url parameter to enable cheat mode.

eg: https://orbit-game.com?FRIENDS

it will speed up the game by 4x

cheat mode is set only once when the game loads

refresh page with the URL parameter to set the cheat mode on.

## Parties

### 🦴 Bone Party

### 🌸 Flower Party

### 🌵 Cactus Party

### 🧀 Cheese Party

### 🦋 Butterfly Party

### 🎒 Backpack Party

### 🥁 Drum Party

### 📺 Television Party

### 💊 Pill Party
