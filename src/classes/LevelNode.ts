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
    serverCaptured = false;

    capturing = false;
    serverCapturing = false;

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

        if (this.type === NodeType.SERVER) {
            this.serverCaptured = true;
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
    getConnectedNodes(): LevelNode[] {
        const nodes = new Map<string, LevelNode>();
        for (const conn of this.connections) {
            const node = conn.getOtherNode(this);
            nodes.set(node.key, node);
        }
        return Array.from(nodes.values());
    }

    getCaptured(server = false): boolean {
        return server ? this.serverCaptured : this.captured;
    }

    addConnection(connection: NodeConnection): void {
        this.connections.push(connection);
    }

    isDisabled(server = false): boolean {
        return !(this.getCaptured(server) || this.isConnectedToCaptured(server));
    }

    canBeCaptured(server = false): boolean {
        return (this.isConnectedToCaptured(server) && !this.isDisabled(server));
    }

    canBeFortified(): boolean {
        return this.captured && !this.fortified;
    }

    isConnectedToCaptured(server = false): boolean {
        for (const conn of this.connections) {
            if (conn.endsWith(this)) {
                const node = conn.getOtherNode(this);
                if (node.getCaptured(server)) {
                    return true;
                }
            }
        }
        return false;
    }

    appearsCaptured(server = false): boolean {
        return this.getCaptured(server) && this.type !== NodeType.ENTRY;
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

    /**
     * Gets the detection chance out of 100.
     */
    getDetectionChance(player: Player): number {
        let chance = (this.level * 20) - (player.upgrades.get(UpgradeType.STEALTH).currentLevel * 15);
        if (chance < 15) {
            chance = 15;
        }
        return chance;
    }
}
