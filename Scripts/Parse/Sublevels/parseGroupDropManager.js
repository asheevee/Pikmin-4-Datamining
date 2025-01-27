import { InfoType, MarkerType } from "../types.js";
import { getObjectFromPath, removeUndefineds } from "../util.js";
import { parseDropList } from "./parseDrops.js";

// NOTE: there is 1 group drop manager in an Objects file (Cave009)
export function isGroupDropManagerComp(comp) {
  return !!comp.Properties.GroupDropManager;
}

export function parseGroupDropManagerComp(comp, compsList) {
  const GroupDropManager = getObjectFromPath(comp.Properties.GroupDropManager, compsList);

  const ignoreIds = GroupDropManager.Properties.GroupDropManagerAIParameter.IgnoreCIDList;
  const radius = GroupDropManager.Properties.GroupDropManagerAIParameter.GroupingRadius;
  // TODO: there are a few GorupDropManager's that don't drop anything. Do they have a default?
  const drops = GroupDropManager.Properties.GroupDropManagerAIParameter?.DropParameter?.DropItemParameter
    ? parseDropList(GroupDropManager.Properties.GroupDropManagerAIParameter.DropParameter)
    : [];
  if (drops.length !== 1) {
    console.warn('GroupDropManager drops something other than a single item.');
  }
  if (!radius) {
    console.warn(`Unknown/bad GroupDropManager radius: ${radius}.`);
  }

  return removeUndefineds({
    type: MarkerType.MiscGroupdropmanager,
    infoType: InfoType.Misc,
    ignoreIds,
    radius,
    drops
  });
}