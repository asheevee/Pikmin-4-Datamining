// TODO auto build this list w/ debugDropItems
const AllDropValues = [
  'GPikminRed_C',
  'GPikminYellow_C',
  'GPikminBlue_C',
  'GPikminPurple_C',
  'GPikminWhite_C',
  'GPikminRock_C',
  'GPikminWing_C',
  'GPikminIce_C',
  'GHoney_C',
  'GPiecePick_C',
  // This drop appears in non-night areas. might just be a copy/paste thing from night enemies.
  // Or can you grow glow pikmin in caves too?
  'GHikariStation_C',
  'GHotExtract_C'
];

const DropsToExclude = ['GHikariStation_C'];


const TrackedDropValues = {};
function trackDropItem(item) {
  TrackedDropValues[item] = true;
}

export function debugDropItems() {
  console.log(Object.keys(TrackedDropValues));
}

export const DefaultLarvaDrop = {
  item: 'GBaby_C',
  chance: 1.0,
  min: 1,
  max: 1,
};

/*
 * DropParameter for objects comes from Properties.ObjectAIParameter.DropParameter
 */
export function parseObjectDropList(comp, defaultDrop = undefined) {
  if (!comp.Properties?.ObjectAIParameter?.DropParameter?.DropItemParameter) {
    return defaultDrop ? [defaultDrop] : [];
  }

  // there's one mound (Secluded Courtyard Floor 3) with this annoying parameter
  const dropAmountMultiplier = comp.Properties.TateanaAIParameter?.NumDig || 1;

  return parseDropList(comp.Properties.ObjectAIParameter.DropParameter, defaultDrop, dropAmountMultiplier);
}

export function parseCreatureDropList(aiComp) {
  if (!aiComp.Properties?.TekiAIParameter?.DropParameter?.DropItemParameter) {
    return [];
  }

  return parseDropList(aiComp.Properties.TekiAIParameter.DropParameter);
}

// NOTE: Some objects have "RareDropParameter", but this always seems to be empty or with drop-rates,min,max set to 0.
export function parseDropList(DropParameter, defaultDrop = undefined, dropAmountMultiplier = 1) {
  // TODO: a few have "null" DropActor's. What are the default drops?
  const dropsWithUndefineds = DropParameter.DropItemParameter.map((dropItem) => {
    if (dropItem.DropRatio <= 0.0 || dropItem.MaxNum <= 0) {
      return undefined;
    }
    if (!dropItem.SpawnMiniInfo?.DropActor?.ObjectName) {
      return defaultDrop;
    }

    const blueprintName = dropItem.SpawnMiniInfo.DropActor.ObjectName;
    const internalItemName = blueprintName.substring(blueprintName.indexOf("'") + 1, blueprintName.length - 1);
    trackDropItem(internalItemName);

    return {
      item: internalItemName,
      chance: dropItem.DropRatio,
      min: dropItem.MinNum * dropAmountMultiplier,
      max: dropItem.MaxNum * dropAmountMultiplier,
    };
  });

  // filter out the undefineds and DropsToExclude
  return dropsWithUndefineds.filter(dropItem => dropItem && !DropsToExclude.includes(dropItem.item));
}
