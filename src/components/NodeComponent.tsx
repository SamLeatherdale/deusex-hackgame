import React, {CSSProperties, ReactElement} from "react";
import LevelNode from "../classes/LevelNode";
import NodeTypeSprite from "../classes/NodeTypeSprite";
import {CaptureStatus, condAttr, NodeSelection, rollTheDice, TypedObj} from "../shared";
import {NodeType} from "../classes/LevelData";
import NodeMenu, {NodeMenuAction} from "./NodeMenu";
import * as autoBind from "auto-bind";
import Player from "../classes/Player";
import Level, {LevelStatus} from "../classes/Level";
import {UpgradeType} from "../classes/Upgrade";
import {ItemType} from "../classes/Item";
import ConnectionComponent from "./ConnectionComponent";
import {delay} from "q";

interface NodeComponentProps {
    level: Level;
    node: LevelNode;
    player: Player;
    server: Player;
    updateNodes: (node: NodeSelection, values: Partial<LevelNode>) => void;
    updateLevel: (values: Partial<Level>) => void;
    updatePlayer: (player: Player, values: TypedObj<any>) => void;
}

class NodeComponentState {
    //capturing: boolean = false;
    fortifying: boolean = false;
}

export default class NodeComponent extends React.Component<NodeComponentProps, NodeComponentState> {
    constructor(props: NodeComponentProps) {
        super(props);
        this.state = new NodeComponentState();

        autoBind.react(this);
    }

    onClickNode(e: React.MouseEvent<HTMLElement, MouseEvent>) {
        e.stopPropagation(); //Prevent closing menu due to bg handler
        if (!this.props.node.isDisabled()) {
            this.props.updateNodes(true, {menuOpen: false});
            this.props.updateNodes(this.props.node, {menuOpen: true})
        }
    }

    onNodeMenuAction(e: MouseEvent, action: NodeMenuAction) {
        e.stopPropagation(); //Prevent re-opening menu

        switch (action) {
            case NodeMenuAction.CAPTURE:
                this.captureNode();
                break;
            case NodeMenuAction.NUKE:
                this.nukeNode();
                break;
            case NodeMenuAction.STOP:
                this.stopNode();
                break;
            case NodeMenuAction.FORTIFY:
                this.fortifyNode();
                break;
        }
    }

    postCaptureNode(isNuke: boolean = false) {
        const {node, updateLevel, player, level} = this.props;

        //Check isComplete so we don't override fail state
        if (level.isComplete()) {
            return;
        }

        if (level.goalCaptured()) {
            updateLevel({status: LevelStatus.COMPLETE});
        } else if (!isNuke && rollTheDice(node.getDetectionChance(player))) {
            updateLevel({isPlayerDetected: true});
        }
    }

    captureNode() {
        const {node, updateNodes} = this.props;

        //Find connection(s) to this node
        const conns = node.getActiveConnectionsToNode();
        conns.forEach(conn => conn.captured = CaptureStatus.CAPTURING);

        updateNodes(node, {
            menuOpen: false
        });

        //Wait for connection animation to complete
        delay(ConnectionComponent.CAPTURE_TIME)
        .then(() => {
            conns.forEach(conn => conn.captured = CaptureStatus.CAPTURED);

            updateNodes(node, {
                captured: CaptureStatus.CAPTURING
            });


            //Wait for node capturing animation to complete
            return delay(node.getCaptureTime(this.props.player));
        }).then(() => {
            updateNodes(node, {
                captured: CaptureStatus.CAPTURED,
            });

            this.postCaptureNode();
        });

    }

    nukeNode() {
        const {node, updateNodes, updatePlayer, player} = this.props;
        updateNodes(node, {
            menuOpen: false,
            captured: CaptureStatus.CAPTURED
        });

        player.items.get(ItemType.NUKE).useItem();
        updatePlayer(player, {});

        this.postCaptureNode(true);
    }

    stopNode() {

    }

    fortifyNode() {
        if (this.props.node.canBeFortified()) {
            this.props.updateNodes(this.props.node, {menuOpen: false});
            this.setState({fortifying: true});

            setTimeout(() => {
                this.props.updateNodes(this.props.node, {fortified: true});
                this.setState({fortifying: false});
            }, this.props.node.getFortifyTime(this.props.player))
        }
    }

    static getMask(style: CSSProperties, attributes: TypedObj<any> = {}): ReactElement {
        return (
            <div key={JSON.stringify(attributes)}
                 className="level-node-mask"
                 style={style}
                 {...attributes}
            />
        )
    }

    getMasks(spriteUrl: string): ReactElement[] {
        const {node, player, server} = this.props;
        const {fortifying} = this.state;

        const masks: ReactElement[] = [];
        let maskStyle: CSSProperties = {
            mask: spriteUrl,
            WebkitMaskImage: spriteUrl,
        };

        if (node.isCapturing()) {
            masks.push(NodeComponent.getMask(
                {
                    animationDuration: `${node.getCaptureTime(player)}ms`,
                    ...maskStyle
                }, {"data-capturing": 'user'}));
        }
        if (node.isCapturing(true)) {
            masks.push(NodeComponent.getMask({
                animationDuration: `${node.getCaptureTime(server)}ms`,
                ...maskStyle
            }, {"data-capturing": 'server'}));
        }
        if (fortifying) {
            masks.push(NodeComponent.getMask({
                animationDuration: `${node.getFortifyTime(player)}ms`,
                ...maskStyle
            }, {"data-fortifying": true}));
        }
        if (node.appearsCaptured()) {
            masks.push(NodeComponent.getMask(maskStyle, {"data-captured": true}));
        }
        return masks;
    }

    render() {
        const {node, player, server} = this.props;
        const {x, y, menuOpen} = node;

        const sprite = NodeTypeSprite.getSprite(node.type);
        const spriteUrl = `url("${sprite}")`;
        const backgroundStyle: CSSProperties = {
            backgroundImage: spriteUrl,
        };

        return (
            <div className="level-node-grid"
                 style={{
                    gridColumn: `${x + 1} / span 1`,
                    gridRow: `${y + 1} / span 1`,
                }}>
                <div className="level-node"
                     data-disabled={condAttr(node.isDisabled())}
                     onClick={this.onClickNode}
                    >
                    {menuOpen &&
                        <NodeMenu node={node}
                                  player={player}
                                  onNodeMenuAction={this.onNodeMenuAction} />}
                    {this.getMasks(spriteUrl)}
                    <div className="level-node-img" style={backgroundStyle} />
                    <div className="level-node-level-text">{node.level}</div>
                    {node.isCaptured(true) && node.type !== NodeType.SERVER &&
                    <div className="level-node-server-captured">
                        {server.upgrades.get(UpgradeType.CAPTURE).currentLevel}
                    </div>
                    }
                </div>
            </div>
        );
    }
}
