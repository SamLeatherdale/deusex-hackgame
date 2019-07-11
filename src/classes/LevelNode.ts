import {NodeData, NodeType} from "./LevelData";
import NodeConnection from "./NodeConnection";
import {TypedObj} from "../shared";
import _ from "lodash";
import Player from "./Player";
import {UpgradeType} from "./Upgrade";

export default class LevelNode extends NodeData {
    lastUpdated: number;
    row: number;
    col: number;
    key: string;
    connections: NodeConnection[] = [];

    captured = false;
    fortified = false;
    menuOpen = false;

    static getKey(x: number, y: number) {
        return `${x},${y}`;
    }

    /**
     *
     * @param config    A NodeData config object, or an existing instance to clone.
     */
    constructor(config: NodeData) {
        super();
        Object.assign(this, config); //Copy JSON properties over
        if (typeof this.key === "undefined") {
            this.init(config);
        }
    }

    /*---------
     * OO stuff
     *---------*/

    init(config: NodeData) {
        this.row = config.y;
        this.col = config.x;
        this.key = LevelNode.getKey(this.x, this.y);

        //Automatically enable entry nodes
        if (this.type === NodeType.ENTRY) {
            this.captured = true;
        }
    }

    updatePath(obj: TypedObj<any>): void {
        for (let path of Object.keys(obj)) {
            _.set(this, path, obj[path]);
        }
        this.lastUpdated = Date.now();
    }

    /**
     * Returns a new object with the provided object of values applied to it.
     * @param obj
     */
    updateImmutablePath(obj: TypedObj<any>): LevelNode {
        const o = new LevelNode(this);
        o.updatePath(obj);
        return o;
    }

    equals(node: LevelNode): boolean {
        return this.key === node.key;
    }

    /*---------
     * Capture state accessors
     *---------*/


    addConnection(connection: NodeConnection) {
        this.connections.push(connection);
    }

    isDisabled() {
        return !(this.captured || this.isConnectedToCaptured());
    }

    canBeCaptured() {
        return (this.isConnectedToCaptured() && !this.isDisabled());
    }

    canBeFortified() {
        return this.captured && !this.fortified;
    }

    isConnectedToCaptured() {
        for (const conn of this.connections) {
            if (conn.endsWith(this)) {
                const node = conn.getOtherNode(this);
                if (node.captured) {
                    return true;
                }
            }
        }
        return false;
    }

    appearsCaptured() {
        return this.captured && this.type !== NodeType.ENTRY;
    }

    /**
     * Gets the time to capture the node in ms.
     */
    getCaptureTime(player: Player): number {
        const captureUpgrade = player.upgrades.get(UpgradeType.CAPTURE);
        const captureSlowdownMult = 1 / captureUpgrade.currentLevel;
        return this.level * 1000 * (captureSlowdownMult);
    }

    getFortifyTime(player: Player): number {
        return this.getCaptureTime(player);
    }
}
