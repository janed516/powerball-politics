import * as utils from "./utils.js";

// these are just default; actual sizes are responsive based on screen
export const CONSTANTS = {
  PARTY_SIZE: 100,
  VOTER_SIZE: 8,
  BUDGET_BASE: 20000,
  freeVoterOnBoardMaxCount: 100,
};

export function movementAlgoParty() {
  let cp = this.pixiGfx.position;
  let dx = utils.seededRandomFloat(1, -1);
  let dy = utils.seededRandomFloat(1, -1);
  this.pixiGfx.position.set(cp.x + dx, cp.y + dy);
}

export let POLL_TOPIC = Object.freeze({
  billA: Symbol("billA"),
  billB: Symbol("billB"),
  billC: Symbol("billC"),
});

export let PARTY_TEMPLATE = {
  id: null,
  label: null,
  color: 0x0080ff,
  funds: 20000,
  size: 80,
  isUser: false,
  movementAlgo: null,
  pixiGfx: null,
  orbitingVoters: [],
  campaignPriorities: {},
};

export function movementAlgoVoter() {
  let cp = this.pixiGfx.position;
  let mul = 2;
  let dx = this.moveVector[0] * mul;
  let dy = this.moveVector[1] * mul;
  this.pixiGfx.position.set(cp.x + dx, cp.y + dy);
}

export let VOTER = {
  id: null,
  color: 0xcc80cc,
  movementAlgo: null,
  moveVector: [0, 0],
  pixiGfx: null,
  oribitingParty: null,
  partyRejectList: [],
  pollPriorities: {},
};

export let GAME_STATE = {
  isPaused: true,
  cumulativeVoterStats: {},
  parties: [],
  userPrefs: null,
  freeVoters: null, // use a Map after init to keep track of freeVoters
  votersInLimbo: null, // use a Map after init to keep track of votersInLimbo
};

export let USER_PREFS = {
  userPartyChoice: "",
  isCheatMode: false,
};
