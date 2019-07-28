import {NodeData, NodeType} from "./LevelData";
import NodeConnection from "./NodeConnection";
import {CaptureStatus, TypedObj} from "../shared";
import _ from "lodash";
import Player from "./Player";
import {UpgradeType} from "./Upgrade";
import {ItemType} from "./Item";
import {DEBUG_MODE} from "../index";

export default class LevelNode extends NodeData {
    lastUpdated: number;
    row: number;
    col: number;
    key: string;
    connections: NodeConnection[] = [];

    captured = CaptureStatus.NONE;
    serverCaptured = CaptureStatus.NONE;
    serverCapturedLevel = 0;

    fortified = false;
    fortifiedLevel = 0;

    menuOpen = false;

    private readonly FORCE_CAPTURE_DETECTION = DEBUG_MODE && true;
    private readonly FORCE_NO_CAPTURE_DETECTION = DEBUG_MODE && false;
    private readonly SERVER_CAPTURE_MULT = DEBUG_MODE ? 2 : 1;
    private readonly USER_CAPTURE_MULT = DEBUG_MODE ? 1 : 1;

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
            this.captured = CaptureStatus.CAPTURED;
        }

        if (this.type === NodeType.SERVER) {
            this.serverCaptured = CaptureStatus.CAPTURED;
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

    toString(): string {
        return `${this.key} (${this.type})`;
    }

    /*---------
     * Capture state accessors
     *---------*/

    /**
     * Gets all nodes connected to this node.
     */
    getConnectedNodes(): LevelNode[] {
        const nodes = new Map<string, LevelNode>();
        for (const conn of this.connections) {
            const node = conn.getOtherNode(this);
            nodes.set(node.key, node);
        }
        return Array.from(nodes.values());
    }

    /**
     * Gets the connection that connects this node to the given node.
     * @param otherNode
     */
    getConnection(otherNode: LevelNode): NodeConnection {
        const conns = this.connections.filter(conn => conn.getOtherNode(this).equals(otherNode));
        return conns.length > 0 ? conns[0] : null;
    }

    /**
     * Gets the node connections that have at least one captured end.
     * @param server    Whether to check captured by the server or the player.
     * @param getCaptured  whether to return connections that have already been captured.
     */
    getActiveConnectionsToNode(server = false, getCaptured = false): NodeConnection[] {
        return this.connections.filter(conn => {
            if (!getCaptured && conn.isCaptured(server)) {
                return false;
            }
            const start = conn.getOtherNode(this);
            return start.isCaptured(server) && conn.endsWith(this);
        });
    }

    /**
     * Returns true if the node has completed capturing.
     * @param server
     */
    isCaptured(server = false): boolean {
        return server ? this.serverCaptured === CaptureStatus.CAPTURED : this.captured === CaptureStatus.CAPTURED;
    }

    isCapturing(server = false): boolean {
        return server ? this.serverCaptured === CaptureStatus.CAPTURING : this.captured === CaptureStatus.CAPTURING;
    }

    getCaptureStatus(server = false) {
        return server ? this.serverCaptured : this.captured;
    }

    addConnection(connection: NodeConnection): void {
        this.connections.push(connection);
    }

    isDisabled(server = false): boolean {
        return !(this.isCaptured(server) || this.isConnectedToCaptured(server));
    }

    canBeCaptured(server = false): boolean {
        return this.isConnectedToCaptured(server)
            && !this.isDisabled(server)
            && this.getCaptureStatus(server) === CaptureStatus.NONE;
    }

    canBeFortified(): boolean {
        return this.isCaptured() && !this.fortified;
    }

    canBeNuked(player: Player): boolean {
        return !this.isCaptured() && player.items.get(ItemType.NUKE).count > 0;
    }

    canBeStopped(player: Player): boolean {
        return this.isCaptured() && player.items.get(ItemType.STOP).count > 0;
    }

    isConnectedToCaptured(server = false): boolean {
        for (const conn of this.connections) {
            if (conn.endsWith(this)) {
                const node = conn.getOtherNode(this);
                if (node.isCaptured(server)) {
                    return true;
                }
            }
        }
        return false;
    }

    appearsCaptured(server = false): boolean {
        return this.isCaptured(server) && this.type !== NodeType.ENTRY;
    }

    /**
     * Gets the effective level of this node when trying to capture.
     * For the player, this is base level + server level
     * For the server, this is base level + player fortify level
     */
    getCaptureLevel(player: Player) {
        if (player.isUser) {
            return this.level + this.serverCapturedLevel;
        } else {
            return this.level + this.fortifiedLevel;
        }
    }

    /**
     * Gets the time to capture the node in ms.
     * @param player    The player who is attempting to capture the node.
     * @param isFortify
     */
    getCaptureTime(player: Player, isFortify = false): number {
        /* PLAYER CAPTURE/FORTIFY TIMES
         *    | Conn | N0/1 | N2   | N3   | N4   | N5   |
         * P1 | 1000 | 1000 | 3000 | 5000 | 7000 | 9000 |
         * P2 | 1000 | 1000 | 2000 | 4000 | 6000 | 8000 |
         * P3 | 1000 | 1000 | 1000 | 3000 | 5000 | 7000 |
         * P4 | 1000 | 1000 | 1000 | 2000 | 4000 | 6000 |
         * P5 | 1000 | 1000 | 1000 | 1000 | 3000 | 5000 |
         * ---------------------------------------
         * SERVER CAPTURE TIMES
         *    | Conn | N0/1 | N2    | N3    | N4    | N5    |
         * S0 | ???? | ???? | 8000  | 12000 | ????  | ????  |
         * S1 | 6000 | 6000 | 6000  | 6000  | 6000  | ????? |
         * S2 | 5000 | 4000 | 7500  | 5000  | 25500 | 36000 |
         * S3 | 750  | 750  | 1500  | 3250  | 5000  | ????  |
         * S4 | 666  | ???? | ????  | 2000  | 3000  | 4000  |
         * S5 | 500  | 750  | 1500  | 2250  | 3750  | 5000  |
         */
        const upgradeLevel = player.upgrades.get(isFortify ? UpgradeType.FORTIFY : UpgradeType.CAPTURE).currentLevel;
        let time;

        if (player.isUser) {
            const baseCapture = this.level * 2000;
            const captureUpgradeModifier = upgradeLevel * 1000;
            time = baseCapture - captureUpgradeModifier;

            //Player's capture time can never be less than 1000ms
            if (time < 1000) {
                time = 1000;
            }
        } else {
            //TODO: Server capture time is complicated
            time = 2000;
        }

        if (player.isUser) {
            time *= this.USER_CAPTURE_MULT;
        } else {
            time *= this.SERVER_CAPTURE_MULT;
        }

        return time;
    }

    getFortifyTime(player: Player): number {
        return this.getCaptureTime(player, true);
    }

    /**
     * Gets the detection chance out of 100.
     */
    getDetectionChance(player: Player): number {
        if (this.FORCE_CAPTURE_DETECTION) {
            return 100;
        }
        if (this.FORCE_NO_CAPTURE_DETECTION) {
            return 0;
        }

        let chance = (this.level * 20) - (player.upgrades.get(UpgradeType.STEALTH).currentLevel * 15);
        if (chance < 15) {
            chance = 15;
        }
        return chance;
    }
}
