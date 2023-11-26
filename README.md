# Powerball Politics

Explore a game to feel the pressures of competitive campaigning.  
Our democracy rests on public participation around current issues and how well it is communicated.  
See how the pressure of numbers incentivise parties to behave in certain ways through this game.

## Introduction

The game starts with 3 bills which are in popular discussion for the duration of the campaign.  
You choose the party for which you will be heading the campaign.  
At each round as the campaign manager, you will allocate the party funds to express support for each of the 3 bills.
Voters have different levels of interest for each bill.  
They support the party which aligns best with their choices across all 3 bills.  
Getting more voters will get you a bigger budget

## Rules

### Voter behaviour

If a voter has a high priority on certain issue and the party has a high budget allocation, they align well.  
If a voter has low priority on certain bill, but the party has high allocation, they align less.  
Their final decisions depends on their priorities and the party priority across all 3 issues.

Voters spawn randomly and only have to decide to join a party if they bump into it.  
They enter into a period of limbo when they make their decision.  
If they decide yes, they start circling the party.  
If they decide no, they shoot off in a random direction and can join another party if they run into them.

### Campaign Decisions

The party can emphasize support for each bill based on how they manage their campaign funds.  
Parties have to distribute their funds across all 3 bills as a percentage of their total funds.  
Parties are eliminated based on how many voters they gather after each round.

## Controls

The party stats panel shows the current levels of budget allocation and supporting voters for each party.  
The upper half of this table based on performance progresses to next round.

The people's pulse shows generalized information about the interests of voters gathered across the all voters.  
It provides insight into the general mood of the people.

## Details

### Voter choices

Voters express their support for each bill on a scale of 0 to 100 (low to high).  
For voter decision on whether they join the party or not goes by following calculation:  
Let's say voter-A rates bill A at 70, bill B at 10 and bill C at 40.  
At the same time party-1 has allocated 50% of their budget to bill A, 20% of their budget to bill B and 30% of their budget to bill C.  
The voter's alignment with this party is given by `(0.7 * 0.5) + (0.1 * 0.2) + (0.4 * 0.3) = (0.35 + 0.02 + 0.12) = 0.49`  
If the alignment is greater than 0.7, the voter will support the party.

### Party Funds Allocation

Parties start out with similar budget allocations.  
The size of the party depends on the total size of their budget.  
Parties budgets expands based on how many voters they gather.

### The challenge

The contents of the bill may influence the way you prioritize your allocations.  
At the same time voters have their randomly generated interest in each bill.  
You need to survive through to the next round.  
The challenge is balance your poll issues with the choice of people.  
You don't need all votes; you only need to finish in the upper half to survive.

### Rounds

### Cheat Mode

Use `FRIENDS` as url parameter to enable cheat mode.

eg: https://powerball-politics.io?FRIENDS

It will speed up the game by 4x.

Cheat mode is set only once when the game loads.

Refresh page with the URL parameter to set the cheat mode on.

## Developer

### Voter Spawning Logic

Parties spawn around center of screen.  
Voters spawn around edges of screen.

Only applies to freeVoters (i.e. not in limbo, nor orbiting)

- If any outside board (10% buffer) ==> remove them
- If any intersecting with parties; put them in limbo (they sink slowly to party center)
- Count all freeVoters on board; if less than max freeVoters; spawn more (max - freevoter) around edges

### Parties

#### 🦴 Bone Party

#### 🌸 Flower Party

#### 🌵 Cactus Party

#### 🧀 Cheese Party

#### 🦋 Butterfly Party

#### 🎒 Backpack Party

#### 🥁 Drum Party

#### 📺 Television Party

#### 💊 Pill Party
