import * as globalInput from "./globalInput.js";
import * as utils from "./utils.js";
import * as pixiGfx from "./pixiGfx.js";
import * as GameObjects from "./GameObjects.js";

const LOCAL_STORAGE_KEY_USERPREFS = "GAME_PREFS";
const CHEAT_SPEED = 4;

let defaultOpts = {
  debugMode: false,
  gridCellSize: 200,
};

let startPartyConfig = [
  {
    color: 0xab47bc,
    label: "🍇 Grape Party",
  },
  {
    color: 0xf06292,
    label: "🌸 Flower Party",
  },
  {
    color: 0x689f38,
    label: "🌵 Cactus Party",
  },
  {
    color: 0xffa726,
    label: "🧀 Cheese Party",
  },
  {
    color: 0x64b5f6,
    label: "🦋 Butterfly Party",
  },
  {
    color: 0xff7043,
    label: "🎒 Backpack Party",
  },
  {
    color: 0x8d6e63,
    label: "🥁 Drum Party",
  },
  {
    color: 0x546e7a,
    label: "📺 Television Party",
  },
];

const eachRoundLengthInMs = 1000 * 120;

const USDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default class App {
  #app;
  #graphicRootContainer;

  //-----------------------------------------------------------------------------

  constructor() {
    let that = this;

    that.#app = null;
    that.#graphicRootContainer = null;

    that.mousePos = { x: 0, y: 0 };

    that.attachInputEvtListeners();
  }

  //-----------------------------------------------------------------------------

  isAltPressed = false;
  isCtrlPressed = false;
  isShiftPressed = false;

  mouseCanvasPosHistory = [];
  mouseCanvasPosHistoryMaxLength = 80;

  attachInputEvtListeners() {
    let that = this;
    window.addEventListener("keydown", (evt) => {
      if (evt.key === "Alt") that.isAltPressed = true;
      if (evt.key === "Control" || evt.metaKey) that.isCtrlPressed = true;
      if (evt.key === "Shift") that.isShiftPressed = true;
      if (evt.key === "Shift") evt.preventDefault();
    });
    window.addEventListener("keyup", (evt) => {
      if (evt.key === "Alt") that.isAltPressed = false;
      if (evt.key === "Control" || evt.metaKey) that.isCtrlPressed = false;
      if (evt.key === "Shift") that.isShiftPressed = false;
    });
  }

  onMouseMove(evt) {
    let p = this.#graphicRootContainer.toLocal(evt.data.global);
    this.mouseCanvasPosHistory.push(p);
    if (
      this.mouseCanvasPosHistory.length >= this.mouseCanvasPosHistoryMaxLength
    ) {
      this.mouseCanvasPosHistory.shift();
    }
  }

  onMouseUp(evt) {
    let p = this.#graphicRootContainer.toLocal(evt.data.global);

    // let pg = pixiGfx.getDebugPoint({
    //   color: 0xff00ff,
    // });
    // let x = p.x;
    // let y = p.y;
    // pg.position.set(x, y);
    // this.#graphicRootContainer.addChild(pg);
  }

  //-----------------------------------------------------------------------------

  #refs = {};

  ctrlAttach(ctrls, label, fn) {
    let dict_selPrefix = {
      class: ".",
      id: "#",
      undefined: "#",
    };

    let dict_selField = {
      class: "class",
      id: "id",
      undefined: "id",
    };

    // find the ctrl js objs from frontend init fn
    let ctrl_obj = ctrls.find((c) => c.ctrl === label);
    // build the selection query based on type of selector (id: single, class: multiple) -> ${prefix: ./#}{obj[selType from obj: id/class]}
    let ctrl_querySel = `${dict_selPrefix[ctrl_obj.selType]}${
      ctrl_obj[dict_selField[ctrl_obj.selType]]
    }`;
    // make the query and get HTML elems
    let elems = document.querySelectorAll(ctrl_querySel);
    // perf given fn on elems
    fn(elems);
  }

  attachUIControllers(ctrls) {
    let that = this;

    // INTERVENE_PANE
    let div_intervenePane;
    function findIntervenePaneNode(nodes) {
      div_intervenePane = nodes[0];
    }
    that.ctrlAttach(ctrls, "INTERVENE_PANE", findIntervenePaneNode);

    // INTERVENE_PANE_TOGGLE
    function toggleIntervenePaneOnBtnClk(btns_intervenePaneToggle) {
      for (let btn_intervenePaneToggle of btns_intervenePaneToggle) {
        btn_intervenePaneToggle.addEventListener("pointerup", async (evt) => {
          if (div_intervenePane.classList.contains("visible")) {
            div_intervenePane.classList.add("hidden");
            div_intervenePane.classList.remove("visible");
            that.updateFromInterveneControls();
            that.setGameToPlay();
          } else {
            div_intervenePane.classList.add("visible");
            div_intervenePane.classList.remove("hidden");
            that.setGameToPause();
            that.refreshToInterveneControls();
          }
        });
      }
    }
    that.ctrlAttach(
      ctrls,
      "INTERVENE_PANE_TOGGLE",
      toggleIntervenePaneOnBtnClk
    );

    // INTERVENE_CONTROLS_CONTAINER
    function findRef_div_interveneControlsContainer(nodes) {
      that.#refs.div_interveneControlsContainer = nodes[0];
    }
    that.ctrlAttach(
      ctrls,
      "INTERVENE_CONTROLS_CONTAINER",
      findRef_div_interveneControlsContainer
    );

    // PARTY_CHOOSE_PANE
    let div_partyChoosePane;
    function findPartyChoosePaneNode(nodes) {
      div_partyChoosePane = nodes[0];
    }
    that.ctrlAttach(ctrls, "PARTY_CHOOSE_PANE", findPartyChoosePaneNode);

    // PARTY_CHOOSE_OPTIONS_CONTAINER
    let div_partyChooseOptionsContainer;
    function findPartyChooseOptionsContainer(nodes) {
      div_partyChooseOptionsContainer = nodes[0];
      const partyOptions =
        div_partyChooseOptionsContainer.getElementsByTagName("button");
      [...partyOptions].forEach((btn) => {
        btn.addEventListener("click", onClk_partySelectButton);
      });
    }
    that.ctrlAttach(
      ctrls,
      "PARTY_CHOOSE_OPTIONS_CONTAINER",
      findPartyChooseOptionsContainer
    );

    function onClk_partySelectButton(evt) {
      that.setPartyChoice(evt.target.innerHTML);
      that.#setupNewGame();
    }

    // GAME_RESET
    function onClk_gameReset(nodes) {
      nodes[0].addEventListener("pointerup", () => that.resetGame());
    }
    that.ctrlAttach(ctrls, "GAME_RESET", onClk_gameReset);

    // GAME_PLAY
    function onClk_gamePlay(nodes) {
      nodes[0].addEventListener("pointerup", () => that.setGameToPlay());
    }
    that.ctrlAttach(ctrls, "GAME_PLAY", onClk_gamePlay);

    // GAME_PAUSE
    function onClk_gamePause(nodes) {
      nodes[0].addEventListener("pointerup", () => that.setGameToPause());
    }
    that.ctrlAttach(ctrls, "GAME_PAUSE", onClk_gamePause);

    // SCOREBOARD_ELAPSED_TIME
    function findRef_span_elapsedTime(nodes) {
      that.#refs.span_elapsedTime = nodes[0];
    }
    that.ctrlAttach(ctrls, "SCOREBOARD_ELAPSED_TIME", findRef_span_elapsedTime);

    // SCOREBOARD_PARTY_STATS_CONTAINER
    function findRef_div_partyStatContainer(nodes) {
      that.#refs.div_partyStatContainer = nodes[0];
    }
    that.ctrlAttach(
      ctrls,
      "SCOREBOARD_PARTY_STATS_CONTAINER",
      findRef_div_partyStatContainer
    );

    // SCOREBOARD_SUPPORT_SEEN_A
    function findRef_span_supportSeenForBillA(nodes) {
      that.#refs.span_supportSeenForBillA = nodes[0];
    }
    that.ctrlAttach(
      ctrls,
      "SCOREBOARD_SUPPORT_SEEN_A",
      findRef_span_supportSeenForBillA
    );

    // SCOREBOARD_SUPPORT_SEEN_B
    function findRef_span_supportSeenForBillB(nodes) {
      that.#refs.span_supportSeenForBillB = nodes[0];
    }
    that.ctrlAttach(
      ctrls,
      "SCOREBOARD_SUPPORT_SEEN_B",
      findRef_span_supportSeenForBillB
    );

    // SCOREBOARD_SUPPORT_SEEN_C
    function findRef_span_supportSeenForBillC(nodes) {
      that.#refs.span_supportSeenForBillC = nodes[0];
    }
    that.ctrlAttach(
      ctrls,
      "SCOREBOARD_SUPPORT_SEEN_C",
      findRef_span_supportSeenForBillC
    );

    // SCOREBOARD_TOTAL_VOTERS
    function findRef_span_totalVoters(nodes) {
      that.#refs.span_totalVoters = nodes[0];
    }
    that.ctrlAttach(ctrls, "SCOREBOARD_TOTAL_VOTERS", findRef_span_totalVoters);
  }

  //-----------------------------------------------------------------------------

  tickIntervalCb;

  updateTickInterval() {
    if (this.tickIntervalCb) clearInterval(this.tickIntervalCb);
    this.tickIntervalCb = setInterval(
      this.#updateGameTick.bind(this),
      this.#tickSpeed
    );
  }

  async initialize(opts) {
    let activeOpts = { ...defaultOpts, ...(opts || {}) };

    if (activeOpts.debugMode) {
      utils.setSeed(1);
    } else {
      utils.setSeed(new Date().getTime());
    }

    let pixiContainerDomNode = document.getElementById("pixiContainer");
    if (!pixiContainerDomNode) {
      let newNode = document.createElement("div", "");
      newNode.setAttribute("id", "pixiContainer");
      document.body.appendChild(newNode);
      pixiContainerDomNode = document.getElementById("pixiContainer");
    }

    this.#app = new PIXI.Application({
      resizeTo: window,
      antialias: true,
      backgroundColor: 0xffffff,
    });
    pixiContainerDomNode.appendChild(this.#app.view);

    this.#graphicRootContainer = new PIXI.Container();
    this.#graphicRootContainer.interactive = true;
    this.#app.stage.addChild(this.#graphicRootContainer);

    this.#graphicRootContainer.on(
      "mousemove",
      (evt) => this.onMouseMove(evt),
      false
    );
    this.#graphicRootContainer.on(
      "mouseup",
      (evt) => this.onMouseUp(evt),
      false
    );

    let gridCellSize = activeOpts.gridCellSize;
    let canvas = document.createElement("canvas");
    canvas.width = gridCellSize;
    canvas.height = gridCellSize;

    let context = canvas.getContext("2d");
    context.fillStyle = "#c3c6d4";
    context.beginPath();
    context.arc(gridCellSize / 2, gridCellSize / 2, 8, 0, 2 * Math.PI, false);
    context.fill();

    let tileTexture = PIXI.Texture.from(canvas);
    let bg = new PIXI.TilingSprite(tileTexture, 10000, 10000);
    bg.anchor.set(0.5, 0.5);
    bg.scale.x = 0.1;
    bg.scale.y = 0.1;
    bg.width = 100000;
    bg.height = 100000;
    bg.interactive = true;

    this.#graphicRootContainer.addChild(bg);

    // // NOTE: uncomment to renable zoom and pan
    // globalInput.bindInput(
    //   this.#app.view,
    //   this.#graphicRootContainer,
    //   this.#app.stage,
    //   bg
    // );

    let ctrls = activeOpts.ctrls;
    this.attachUIControllers(ctrls);

    this.startAnimation();
    // this.render();

    this.updateTickInterval.call(this);

    window.addEventListener("beforeunload", this.onExitCleanUp);

    // read url param for cheat mode and store to userPrefs
    await this.readFromUserPrefs();
    const urlParams = new URLSearchParams(window.location.search);
    const cheatParam = urlParams.has("FRIENDS");
    this.#userPrefs.isCheatMode = cheatParam;
    await this.writeToUserPrefs();

    if (this.#userPrefs.isCheatMode) {
      // update to speed up things
      this.#tickSpeed /= CHEAT_SPEED;
      this.updateTickInterval.call(this);
    }

    if (!this.#userPrefs.userPartyChoice) {
      // show party pick screen and then continue in callback
      div_partyChoosePane.classList.add("visible");
      div_partyChoosePane.classList.remove("hidden");
    }
  }

  startAnimation = async function () {
    const that = this;
    that.#app.ticker.add((delta) => {
      that.render(delta);
    });
    return that;
  };

  render = async function () {
    const that = this;
    that.#app.renderer.render(that.#app.stage);
    return that;
  };

  //-----------------------------------------------------------------------------
  /*
 
    ____    _    __  __ _____   ____ _____ _   _ _____ _____ 
   / ___|  / \  |  \/  | ____| / ___|_   _| | | |  ___|  ___|
  | |  _  / _ \ | |\/| |  _|   \___ \ | | | | | | |_  | |_   
  | |_| |/ ___ \| |  | | |___   ___) || | | |_| |  _| |  _|  
   \____/_/   \_\_|  |_|_____| |____/ |_|  \___/|_|   |_|    
                                                             
 
  */
  //-----------------------------------------------------------------------------

  async readFromUserPrefs() {
    let str = localStorage.getItem(LOCAL_STORAGE_KEY_USERPREFS);
    if (!str) {
      let tmpUserPrefs = JSON.parse(JSON.stringify(GameObjects.USER_PREFS));
      // tmpUserPrefs.userPartyChoice = "purple";
      str = JSON.stringify(tmpUserPrefs);
      this.#userPrefs = JSON.parse(str);
      await this.writeToUserPrefs();
    }
    this.#userPrefs = JSON.parse(str);
  }

  async writeToUserPrefs() {
    localStorage.setItem(
      LOCAL_STORAGE_KEY_USERPREFS,
      JSON.stringify(this.#userPrefs)
    );
  }

  async onExitCleanUp() {
    localStorage.removeItem(LOCAL_STORAGE_KEY_USERPREFS);
  }

  async setPartyChoice(newChoice) {
    this.#userPrefs.userPartyChoice = newChoice;
    await this.writeToUserPrefs();
    div_partyChoosePane.classList.add("hidden");
    div_partyChoosePane.classList.remove("visible");
  }

  #tickSpeed = 30;
  #currentGame = null;
  #userPrefs = null;
  #currentElapsedTime = null;

  #disposeCurrentGame = async function () {
    // remove objs from pixi canvas
    for (let p of this.#currentGame.parties) {
      this.#graphicRootContainer.removeChild(p.pixiGfx);
    }
    for (let v of this.#currentGame.freeVoters.values()) {
      this.#graphicRootContainer.removeChild(v.pixiGfx);
    }
    for (let v of this.#currentGame.votersInLimbo.values()) {
      this.#graphicRootContainer.removeChild(v.voter.pixiGfx);
    }

    // disconnect inputs
    // reset scores display
    // show splash screen
    this.#currentElapsedTime = null;
    this.#currentGame = null;
  };

  #setupNewGame = async function () {
    let minDim = Math.min(this.#app.renderer.width, this.#app.renderer.height);
    GameObjects.CONSTANTS.PARTY_SIZE = Math.floor(minDim * 0.08);
    GameObjects.CONSTANTS.VOTER_SIZE = Math.floor(
      GameObjects.CONSTANTS.PARTY_SIZE * 0.08
    );

    let screenArea = this.#app.renderer.width * this.#app.renderer.height;
    GameObjects.CONSTANTS.freeVoterOnBoardMaxCount = Math.floor(
      screenArea / 20000
    );

    //  create new game from the template
    this.#currentGame = JSON.parse(JSON.stringify(GameObjects.GAME_STATE));
    this.#currentGame.freeVoters = new Map();
    this.#currentGame.votersInLimbo = new Map();
    this.#currentGame.cumulativeVoterStats = {};

    this.#currentGame.cumulativeVoterStats[GameObjects.POLL_TOPIC.billA] = 0;
    this.#currentGame.cumulativeVoterStats[GameObjects.POLL_TOPIC.billB] = 0;
    this.#currentGame.cumulativeVoterStats[GameObjects.POLL_TOPIC.billC] = 0;
    this.#currentGame.cumulativeVoterStats.votersSeen = 0;

    let leftClearance = this.#app.renderer.width / 4;
    let horizontalRange = this.#app.renderer.width / 2;
    let topClearance = this.#app.renderer.height / 4;
    let verticalRange = this.#app.renderer.height / 2;

    let currRoundPartyConfig = startPartyConfig;

    this.#currentGame.parties = [];
    for (let pc of currRoundPartyConfig) {
      // instantiate gameobject
      let partyObj = JSON.parse(JSON.stringify(GameObjects.PARTY_TEMPLATE));
      let randIdForParty = Math.round(utils.seededRandomFloat(9999, 1000));
      partyObj.id = `p-${randIdForParty}`;
      partyObj.color = pc.color;
      partyObj.label = pc.label;
      partyObj.size =
        GameObjects.CONSTANTS.PARTY_SIZE * utils.seededRandomFloat(1.1, 0.9);
      partyObj.funds = Math.round(
        GameObjects.CONSTANTS.BUDGET_BASE * utils.seededRandomFloat(1.1, 0.9)
      );
      partyObj.isUser = this.#userPrefs.userPartyChoice === partyObj.label;

      let pixiGfx_party = pixiGfx.getGfx_party({
        color: partyObj.color,
        size: partyObj.size,
        label: partyObj.label,
      });

      // find non-intersecting point for other parties
      let posCandidate;
      let doesIntersect = true;
      let nonIntersectBuffer = 1.5; // avoids spawning too close
      let c = 0;
      let maxC = 1000;
      do {
        posCandidate = {
          x: leftClearance + utils.seededRandomFloat(horizontalRange),
          y: topClearance + utils.seededRandomFloat(verticalRange),
        };
        doesIntersect = utils.checkIntersections(
          {
            pos: posCandidate,
            radius: partyObj.size * nonIntersectBuffer,
          },
          this.#currentGame.parties.map((p) => {
            return {
              pos: p.pixiGfx.position,
              radius: p.size * nonIntersectBuffer,
            };
          })
        );
        c++;
      } while (doesIntersect && c < maxC);

      // add circle in center area of screen
      pixiGfx_party.position.set(posCandidate.x, posCandidate.y);
      partyObj.pixiGfx = pixiGfx_party;
      this.#graphicRootContainer.addChild(partyObj.pixiGfx);
      partyObj.movementAlgo = GameObjects.movementAlgoParty.bind(partyObj);
      this.#currentGame.parties.push(partyObj);

      // set campaign priorities
      let numA = utils.seededRandomFloat(0.4, 0.01);
      let numB = utils.seededRandomFloat((1 - numA) * 0.8, 0.01);
      let numC = 1 - numA - numB;

      partyObj.campaignPriorities = {
        [GameObjects.POLL_TOPIC.billA]: numA,
        [GameObjects.POLL_TOPIC.billB]: numB,
        [GameObjects.POLL_TOPIC.billC]: numC,
      };
    }

    // instantiate freeVoters; don't await for the function
    this.refreshFreeVoters();

    this.#updateUIStats();

    this.#currentElapsedTime = 0;
  };

  resetGame = async function () {
    if (this.#currentGame) {
      await this.#disposeCurrentGame();
    }
    await this.#setupNewGame();
  };

  setGameToPause = async function () {
    if (!this.#currentGame) return;
    this.#currentGame.isPaused = true;
  };

  setGameToPlay = async function () {
    if (!this.#currentGame) return;
    this.#currentGame.isPaused = false;
  };

  #updateGameTick = async function () {
    if (!this.#currentGame) return;
    if (this.#currentGame.isPaused) return;

    for (let p of this.#currentGame.parties) {
      p.movementAlgo();
      let nucleusPos = p.pixiGfx.position;
      for (let orbitingVoter of p.orbitingVoters) {
        // calculate angle to be a function of voter id; each has unique but consistent speed
        let angle =
          0.006 + Math.PI * (utils.getHash(orbitingVoter.id, 4000) / 200000);
        let newPos = utils.rotateAroundPoint(
          orbitingVoter.pixiGfx.position,
          nucleusPos,
          angle
        );
        orbitingVoter.pixiGfx.position.set(newPos.x, newPos.y);
      }
    }

    for (let v of this.#currentGame.freeVoters.values()) {
      v.movementAlgo();
    }

    // go through votersInLimbo
    for (let voterInLimboObj of this.#currentGame.votersInLimbo.values()) {
      // reduce time from limboTimeLeft on each voter
      voterInLimboObj.limboTime -= this.#tickSpeed;
      // if limboTimeLeft === 0; do decision calcs
      if (voterInLimboObj.limboTime <= 0) {
        let eduSc =
          voterInLimboObj.party.campaignPriorities[
            GameObjects.POLL_TOPIC.billA
          ] *
          voterInLimboObj.voter.pollPriorities[GameObjects.POLL_TOPIC.billA];
        let hltSc =
          voterInLimboObj.party.campaignPriorities[
            GameObjects.POLL_TOPIC.billB
          ] *
          voterInLimboObj.voter.pollPriorities[GameObjects.POLL_TOPIC.billB];
        let idsSc =
          voterInLimboObj.party.campaignPriorities[
            GameObjects.POLL_TOPIC.billC
          ] *
          voterInLimboObj.voter.pollPriorities[GameObjects.POLL_TOPIC.billC];
        let sc = eduSc + hltSc + idsSc;
        // converts if score is better than 0.7
        let doesConvert = sc > 0.7;
        // set state to join party or not
        if (doesConvert) {
          this.onDecicdeJoinParty_Yes(
            voterInLimboObj.party,
            voterInLimboObj.voter
          );
        } else {
          this.onDecicdeJoinParty_No(
            voterInLimboObj.party,
            voterInLimboObj.voter
          );
        }
      } else {
        // if time is more continue motion and reduce limboTimeLeft
        voterInLimboObj.voter.movementAlgo();
      }
    }

    await this.refreshFreeVoters();

    this.#currentElapsedTime +=
      this.#tickSpeed * (this.#userPrefs.isCheatMode ? CHEAT_SPEED : 1);
    // update scores
    this.#updateUIStats();

    if (this.#currentElapsedTime >= eachRoundLengthInMs) {
      console.log("timeUp");
      this.setGameToPause();
      this.#performCompleteRoundCalcs();
      // do scores
      // show new popup
      // this.refreshToInterveneControls(); // doesn't open the menu
    }
  };

  rankParty(a, b) {
    if (a.voterCount === b.voterCount) {
      return a.funds > b.funds ? -1 : 1;
    }
    return a.voterCount > b.voterCount ? -1 : 1;
  }

  #performCompleteRoundCalcs() {
    let ppp = this.#currentGame.parties.sort(this.rankParty).map((p) => {
      return {
        label: p.label,
        voterCount: p.orbitingVoters.length,
        funds: p.funds,
      };
    });
    console.log(ppp);
    // loop through all parties
    // calculate voters
    // calculate funds
    // get top half
  }

  #updateUIStats() {
    // update time
    let seconds = String(
      Math.floor((this.#currentElapsedTime / 1000) % 60)
    ).padStart(2, "0");
    let minutes = String(
      Math.floor((this.#currentElapsedTime / 1000 / 60) % 60)
    ).padStart(2, "0");
    this.#refs.span_elapsedTime.innerText = `${minutes}:${seconds}`;

    // update party stats
    this.#refs.div_partyStatContainer.replaceChildren();
    for (let p of this.#currentGame.parties) {
      let div_partyStats = document.createElement("div");
      div_partyStats.classList.add("div_partyStats");
      this.#refs.div_partyStatContainer.appendChild(div_partyStats);

      let div_partyName = document.createElement("div");
      div_partyName.innerText = p.label;
      div_partyStats.appendChild(div_partyName);

      let div_partyVoterCount = document.createElement("div");
      div_partyVoterCount.innerText = p.orbitingVoters.length;
      div_partyStats.appendChild(div_partyVoterCount);

      let div_partyFunds = document.createElement("div");
      div_partyFunds.innerText = USDollar.format(p.funds);
      div_partyStats.appendChild(div_partyFunds);

      let div_partyPositions = document.createElement("div");
      div_partyPositions.innerHTML = `${p.campaignPriorities[
        GameObjects.POLL_TOPIC.billA
      ].toFixed(2)} <br /> ${p.campaignPriorities[
        GameObjects.POLL_TOPIC.billB
      ].toFixed(2)} <br /> ${p.campaignPriorities[
        GameObjects.POLL_TOPIC.billC
      ].toFixed(2)}`;
      div_partyStats.appendChild(div_partyPositions);
    }

    // update population stats
    this.#refs.span_supportSeenForBillA.innerText = (
      this.#currentGame.cumulativeVoterStats[GameObjects.POLL_TOPIC.billA] /
      this.#currentGame.cumulativeVoterStats.votersSeen
    ).toFixed(2);

    this.#refs.span_supportSeenForBillB.innerText = (
      this.#currentGame.cumulativeVoterStats[GameObjects.POLL_TOPIC.billB] /
      this.#currentGame.cumulativeVoterStats.votersSeen
    ).toFixed(2);

    this.#refs.span_supportSeenForBillC.innerText = (
      this.#currentGame.cumulativeVoterStats[GameObjects.POLL_TOPIC.billC] /
      this.#currentGame.cumulativeVoterStats.votersSeen
    ).toFixed(2);

    this.#refs.span_totalVoters.innerText =
      this.#currentGame.cumulativeVoterStats.votersSeen;
  }

  newPrioritiesValsBuffer = {};

  refreshToInterveneControls() {
    let that = this;
    let p = that.#currentGame.parties.find(
      (p) => p.label === this.#userPrefs.userPartyChoice
    );

    that.#refs.div_interveneControlsContainer.replaceChildren();
    let div_partyStats = document.createElement("div");
    div_partyStats.classList.add("div_partyStats");
    that.#refs.div_interveneControlsContainer.appendChild(div_partyStats);

    let div_partyName = document.createElement("div");
    div_partyName.innerText = p.label;
    div_partyStats.appendChild(div_partyName);

    let div_partyVoterCount = document.createElement("div");
    div_partyVoterCount.innerText = `Voters: ${p.orbitingVoters.length}`;
    div_partyStats.appendChild(div_partyVoterCount);

    let div_partyFunds = document.createElement("div");
    div_partyFunds.innerText = `Funds: ${USDollar.format(p.funds)}`;
    div_partyStats.appendChild(div_partyFunds);

    const currPref_billA = p.campaignPriorities[GameObjects.POLL_TOPIC.billA];
    const currPref_billB = p.campaignPriorities[GameObjects.POLL_TOPIC.billB];
    const currPref_billC = p.campaignPriorities[GameObjects.POLL_TOPIC.billC];

    let div_partyPositions = document.createElement("div");
    div_partyPositions.innerHTML = `Bill A: ${currPref_billA.toFixed(2)} <br />
       Bill B: ${currPref_billB.toFixed(2)} <br />
       Bill C: ${currPref_billC.toFixed(2)}`;
    div_partyStats.appendChild(div_partyPositions);

    let div_partyRangeSlider = document.createElement("div");
    div_partyRangeSlider.classList.add("div_partyRangeSlider");
    that.#refs.div_interveneControlsContainer.appendChild(div_partyRangeSlider);
    const rangeSlider = new RangeSlider(".div_partyRangeSlider", {
      step: 0.001,
      min: 0,
      max: 1,
      values: [currPref_billA, currPref_billA + currPref_billB],
    });

    let div_bufferContainer = document.getElementById("bufferContainer");
    if (!div_bufferContainer) {
      div_bufferContainer = document.createElement("div");
      div_bufferContainer.id = "bufferContainer";
      that.#refs.div_interveneControlsContainer.appendChild(
        div_bufferContainer
      );
    }

    function refreshBufferVals() {
      div_bufferContainer.replaceChildren();
      let div_newPrioritiesBuffer = document.createElement("div");
      div_newPrioritiesBuffer.innerHTML = `Bill A: ${that.newPrioritiesValsBuffer[
        GameObjects.POLL_TOPIC.billA
      ].toFixed(2)} <br />
         Bill B: ${that.newPrioritiesValsBuffer[
           GameObjects.POLL_TOPIC.billB
         ].toFixed(2)} <br />
         Bill C: ${that.newPrioritiesValsBuffer[
           GameObjects.POLL_TOPIC.billC
         ].toFixed(2)}`;
      div_bufferContainer.appendChild(div_newPrioritiesBuffer);
    }

    rangeSlider.onChange((newVals) => {
      newVals = newVals.map((n) => Number(n));
      that.newPrioritiesValsBuffer[GameObjects.POLL_TOPIC.billA] = newVals[0];
      that.newPrioritiesValsBuffer[GameObjects.POLL_TOPIC.billB] =
        newVals[1] - newVals[0];
      that.newPrioritiesValsBuffer[GameObjects.POLL_TOPIC.billC] =
        1 - newVals[1];
      refreshBufferVals();
    });

    that.newPrioritiesValsBuffer = {};
    that.newPrioritiesValsBuffer[GameObjects.POLL_TOPIC.billA] = currPref_billA;
    that.newPrioritiesValsBuffer[GameObjects.POLL_TOPIC.billB] = currPref_billB;
    that.newPrioritiesValsBuffer[GameObjects.POLL_TOPIC.billC] = currPref_billC;

    refreshBufferVals();
  }

  updateFromInterveneControls() {
    let that = this;
    let p = that.#currentGame.parties.find(
      (p) => p.label === this.#userPrefs.userPartyChoice
    );
    p.campaignPriorities[GameObjects.POLL_TOPIC.billA] =
      this.newPrioritiesValsBuffer[GameObjects.POLL_TOPIC.billA];
    p.campaignPriorities[GameObjects.POLL_TOPIC.billB] =
      this.newPrioritiesValsBuffer[GameObjects.POLL_TOPIC.billB];
    p.campaignPriorities[GameObjects.POLL_TOPIC.billC] =
      this.newPrioritiesValsBuffer[GameObjects.POLL_TOPIC.billC];
  }

  //-----------------------------------------------------------------------------

  async refreshFreeVoters() {
    // see freeVoter positions;
    //    if any outside board (10% buffer) ==> remove them
    for (let v of this.#currentGame.freeVoters.values()) {
      if (
        v.pixiGfx.position.x < -(this.#app.renderer.width * 0.1) ||
        v.pixiGfx.position.x > this.#app.renderer.width * 1.1 ||
        v.pixiGfx.position.y < -(this.#app.renderer.height * 0.1) ||
        v.pixiGfx.position.y > this.#app.renderer.height * 1.1
      ) {
        // remove from freeVoters list
        this.#graphicRootContainer.removeChild(v.pixiGfx);
        this.#currentGame.freeVoters.delete(v.id);
      }
    }

    // check for freeVoters positions intersecting with parties;
    //    if any ==> call onVoterIntersect on them
    for (let v of this.#currentGame.freeVoters.values()) {
      for (let p of this.#currentGame.parties) {
        let doesIntersect =
          !v.partyRejectList.includes(p.id) &&
          utils.checkCollision(
            { pos: p.pixiGfx.position, radius: p.size },
            {
              pos: v.pixiGfx.position,
              radius: GameObjects.CONSTANTS.VOTER_SIZE,
            }
          );
        if (doesIntersect) {
          this.onVoterIntersect(p, v);
        }
      }
    }

    // count free freeVoters on board;
    //    if less than max ==> spawn more (max - freevoter) around edges
    let innerRectX = this.#app.renderer.width / 10;
    let innerRectY = this.#app.renderer.height / 10;
    let innerRectW = this.#app.renderer.width - 2 * innerRectX;
    let innerRectH = this.#app.renderer.height - 2 * innerRectY;
    for (
      let voterIdx = this.#currentGame.freeVoters.size;
      voterIdx < GameObjects.CONSTANTS.freeVoterOnBoardMaxCount;
      voterIdx++
    ) {
      let newFreeVoter = JSON.parse(JSON.stringify(GameObjects.VOTER));
      let randId = Math.round(utils.seededRandomFloat(9999, 1000));
      newFreeVoter.id = `v-${randId}`;
      let pixiGfx_voter = pixiGfx.getGfx_voter({
        color: newFreeVoter.color,
        size: GameObjects.CONSTANTS.VOTER_SIZE,
      });

      // generate random numbers summing to 1
      let numA = utils.seededRandomFloat(1.0, 0.1);
      let numB = utils.seededRandomFloat(1.0, 0.1);
      let numC = utils.seededRandomFloat(1.0, 0.1);

      // set random poll priorities
      newFreeVoter.pollPriorities = {
        [GameObjects.POLL_TOPIC.billA]: numA,
        [GameObjects.POLL_TOPIC.billB]: numB,
        [GameObjects.POLL_TOPIC.billC]: numC,
      };

      this.#currentGame.cumulativeVoterStats[GameObjects.POLL_TOPIC.billA] +=
        numA;
      this.#currentGame.cumulativeVoterStats[GameObjects.POLL_TOPIC.billB] +=
        numB;
      this.#currentGame.cumulativeVoterStats[GameObjects.POLL_TOPIC.billC] +=
        numC;
      this.#currentGame.cumulativeVoterStats.votersSeen++;

      // find non-intersecting point for the voter
      let posCandidate;
      let doesIntersect = true;
      let nonIntersectBuffer = 2; // avoids spawning too close
      let c = 0;
      let maxC = 1000;
      do {
        posCandidate = utils.randomPointNearRect(
          innerRectX,
          innerRectY,
          innerRectW,
          innerRectH,
          -innerRectH / 5,
          innerRectH / 10
        );
        doesIntersect = this.#currentGame.parties
          .map((party) =>
            utils.checkCollision(
              { pos: posCandidate, radius: GameObjects.CONSTANTS.VOTER_SIZE },
              {
                pos: party.pixiGfx.position,
                radius: party.size * nonIntersectBuffer,
              }
            )
          )
          .reduce(
            (checkCollision, prevRes) => checkCollision || prevRes,
            false
          );
        c++;
      } while (doesIntersect && c < maxC);

      pixiGfx_voter.position.set(posCandidate.x, posCandidate.y);
      newFreeVoter.pixiGfx = pixiGfx_voter;
      let moveVec = utils.pol2rect(
        utils.seededRandomFloat(2, 0.6),
        utils.seededRandomFloat(Math.PI * 2, 0)
      );
      newFreeVoter.moveVector = [moveVec.x, moveVec.y];
      this.#graphicRootContainer.addChild(newFreeVoter.pixiGfx);
      newFreeVoter.movementAlgo =
        GameObjects.movementAlgoVoter.bind(newFreeVoter);
      this.#currentGame.freeVoters.set(newFreeVoter.id, newFreeVoter);
    }
  }

  async onVoterIntersect(party, freeVoter) {
    // take voter and create random vals for limboTime and tgt value for moveVector
    let newMoveVec = utils.getVectorBetween(
      freeVoter.pixiGfx.position,
      party.pixiGfx.position,
      true
    );
    let sinkSpeed = 0.08;
    freeVoter.moveVector = [newMoveVec.x * sinkSpeed, newMoveVec.y * sinkSpeed];

    let newLimboTime = utils.seededRandomFloat(6000, 2000);

    // create wrapper object to carry libo state
    let voterInLimboObj = {
      voter: freeVoter,
      party: party,
      limboTime: newLimboTime,
    };

    // push into votersInLimbo array
    this.#currentGame.votersInLimbo.set(freeVoter.id, voterInLimboObj);

    // remove from freeVoters list
    this.#currentGame.freeVoters.delete(freeVoter.id);
  }

  onDecicdeJoinParty_Yes(party, freeVoter) {
    // add party reference to the freeVoter object
    freeVoter.oribitingParty = party;

    // add the freeVoter object to party object's orbitting list
    party.orbitingVoters.push(freeVoter);

    // remove from votersInLimbo list
    this.#currentGame.votersInLimbo.delete(freeVoter.id);
  }

  onDecicdeJoinParty_No(party, freeVoter) {
    // remove from votersInLimbo list
    this.#currentGame.votersInLimbo.delete(freeVoter.id);

    // set new direction for movement
    let randomVec = utils.pol2rect(
      utils.seededRandomFloat(2, 0.6),
      utils.seededRandomFloat(Math.PI * 2, 0)
    );

    let shootoffSpeed = 1.2;
    let newMoveVec = [randomVec.x * shootoffSpeed, randomVec.y * shootoffSpeed];
    freeVoter.moveVector = newMoveVec;

    freeVoter.partyRejectList.push(party.id);

    // add it back to free voter list
    this.#currentGame.freeVoters.set(freeVoter.id, freeVoter);
  }
}
