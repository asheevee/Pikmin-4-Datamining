import { InfoType, MarkerType, PikminColor } from "../../types.js";
import { getInternalId, removeLocalizationMetadata } from "../../util.js";
import { default as TreasureData } from "../../../../Treasure Data/BaseData.json" assert { type: "json" };
import { default as TreasureNames } from "../../../../Localization/OtakaraName/en-US/OtakaraName.json" assert { type: "json" };

// NOTE: Onion spelled w/ onyomi keystrokes in game files
const OnionColorMap = {
  'GOnyonCarryBoost_C': 'flarlic',
  'GOnyonBootUpRed_C': PikminColor.Red,
  'GOnyonCarryWhite_C': PikminColor.White,
  'GOnyonCarryPurple_C': PikminColor.Purple,
  'GOnyonCarryYellow_C': PikminColor.Yellow,
  'GOnyonCarryBlue_C': PikminColor.Blue,
  'GOnyonCarryIce_C': PikminColor.Ice,
  'GOnyonCarryStone_C': PikminColor.Rock,
  'GOnyonCarryPink_C': PikminColor.Wing,
}
const OnionWeightMap = {
  'flarlic': 5,
  [PikminColor.Red]: 3,
  [PikminColor.Yellow]: 20,
  [PikminColor.Blue]: 20,
  [PikminColor.Purple]: 100,
  [PikminColor.White]: 10,
  [PikminColor.Rock]: 30,
  [PikminColor.Wing]: 10,
  [PikminColor.Ice]: 30,
}
function parseOnionComp(comp) {
  const color = OnionColorMap[comp.Type];
  if (!color) {
    throw new Error('Unknown onion color!');
  }
  const type = `${InfoType.Onion}-${color}`
  const weight = OnionWeightMap[color];

  return {
    type,
    infoType: InfoType.Onion,
    color,
    weight
  };
}


const TreasureNameMap = TreasureNames.OtakaraName;
function getTreasureName(treasureId) {
  const localeStr = TreasureNameMap[treasureId];
  // remove meta-data/styling from treasure names
  return removeLocalizationMetadata(localeStr);
}

const TreasureMap = TreasureData[0].Rows;
function parseTreasureComp(comp) {
  const treasureId = getInternalId(comp.Type);
  const treasure = TreasureMap[treasureId];

  if (!treasure) {
    throw new Error(`Unknown treasure ${treasureId}`);
  }

  return {
    type: MarkerType.Treasure,
    infoType: InfoType.Treasure,
    treasureId: treasureId,
    name: getTreasureName(treasureId),
    weight: treasure.CarryWeightMin,
    carryMax: treasure.CarryWeightMax,
    value: treasure.Kira,
  };
}


function isCastaway(comp) {
  return comp.Type.startsWith('GSurvivor');
}

function parseCastaway(comp) {
  const isLeafling = comp.Type.startsWith('GSurvivorLeaf') ||
    comp.Type.startsWith('GSurvivorOlimarLeaf');
  const isKoppaite = comp.Type.startsWith('GSurvivorKoppai');

  return {
    type: isLeafling ? MarkerType.CastawayLeafling : MarkerType.CastawayNormal,
    infoType: InfoType.Castaway,
    isLeafling,
    isKoppaite,
    weight: 3,
    carryMax: 6
  }
}

export function isCollectableComp(comp) {
  return !!(
    // Castaways are considered treasures <3
    comp.Properties.OtakaraAI ||
    // the 6 cards for the safe (DH and HH), + 2 "blank" Joker cards
    comp.Properties.OtaBankCardAI ||
    comp.Properties.OnyonCarryAI
  )
}

export function parseCollectableComp(comp, compsList) {
  if (comp.Properties.OnyonCarryAI) {
    return parseOnionComp(comp, compsList);
  }
  else if (isCastaway(comp)) {
    return parseCastaway(comp, compsList);
  }
  else if (comp.Properties.OtakaraAI || comp.Properties.OtaBankCardAI) {
    return parseTreasureComp(comp, compsList);
  }
  throw new Error('Unknown collectable!');
}
