import Upgrade, {UpgradeType} from "./Upgrade";
import {TypedObj} from "../shared";
import _ from "lodash";
import UpgradeDefaults from "./UpgradeDefaults";
import Item, {ItemType} from "./Item";
import Level from "./Level";

export default class Player {
    upgrades: Map<UpgradeType, Upgrade> = new Map();
    items: Map<ItemType, Item> = new Map();
    lastUpdated: number;
    isUser: boolean = true;

    constructor() {
        for (const props of UpgradeDefaults.getDefaults()) {
            this.upgrades.set(props.type, new Upgrade(props));
        }
        for (const item of Item.getDefaults()) {
            this.items.set(item.type, item);
        }
    }

    static createFromLevel(level: Level): Player {
        const servers = level.getServerNodes();
        const levels = servers.map(server => server.level);
        const uniqueLevels = [...new Set(levels)];
        let difficulty = uniqueLevels[0];

        if (uniqueLevels.length > 1) {
            difficulty = Math.min(...uniqueLevels);
        }

        const player = new Player();
        player.upgrades.get(UpgradeType.CAPTURE).currentLevel = difficulty;
        player.isUser = false;
        return player;
    }

    updatePath(obj: TypedObj<any>): void {
        for (let path of Object.keys(obj)) {
            _.set(this, path, obj[path]);
        }
        this.lastUpdated = Date.now();
    }
}
