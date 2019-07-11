import Upgrade, {UpgradeProps, UpgradeType} from "./Upgrade";
import {TypedObj} from "../shared";
import _ from "lodash";
import UpgradeDefaults from "./UpgradeDefaults";

export default class Player {
    upgrades: Map<UpgradeType, Upgrade> = new Map();
    lastUpdated: number;

    constructor() {
        for (const props of UpgradeDefaults.getDefaults()) {
            this.upgrades.set(props.type, new Upgrade(props));
        }
    }

    updatePath(obj: TypedObj<any>): void {
        for (let path of Object.keys(obj)) {
            _.set(this, path, obj[path]);
        }
        this.lastUpdated = Date.now();
    }
}