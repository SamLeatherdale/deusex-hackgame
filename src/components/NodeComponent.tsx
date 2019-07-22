import React, {CSSProperties, ReactElement} from "react";
import LevelNode from "../classes/LevelNode";
import NodeTypeSprite from "../classes/NodeTypeSprite";
import {condAttr, NodeSelection, rollTheDice, TypedObj} from "../shared";
import {NodeType} from "../classes/LevelData";
import NodeMenu, {NodeMenuAction} from "./NodeMenu";
import * as autoBind from "auto-bind";
import Player from "../classes/Player";
import Level, {LevelStatus} from "../classes/Level";

interface NodeComponentProps {
    node: LevelNode;
    player: Player;
    server: Player;
    updateNodes: (node: NodeSelection, values: Partial<LevelNode>) => void;
    updateLevel: (values: Partial<Level>) => void;
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

    captureNode() {
        const {node, updateNodes, updateLevel, player} = this.props;
        if (node.canBeCaptured()) {
            updateNodes(node, {
                menuOpen: false,
                capturing: true
            });

            setTimeout(() => {
                updateNodes(node, {
                    captured: true,
                    capturing: false
                });

                if (node.type === NodeType.EXIT) {
                    updateLevel({status: LevelStatus.COMPLETE});
                } else if (rollTheDice(node.getDetectionChance(player))) {
                    updateLevel({isPlayerDetected: true});
                }
            }, node.getCaptureTime(this.props.player))
        }
    }

    nukeNode() {

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
        const {capturing, serverCapturing} = node;

        const masks: ReactElement[] = [];
        let maskStyle: CSSProperties = {
            mask: spriteUrl,
            WebkitMaskImage: spriteUrl,
        };

        if (capturing) {
            masks.push(NodeComponent.getMask(
                {
                    animationDuration: `${node.getCaptureTime(player)}ms`,
                    ...maskStyle
                }, {"data-capturing": 'user'}));
        }
        if (serverCapturing) {
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
        const {node, player} = this.props;
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
                    <div className="level-node-level-text">{this.props.node.level}</div>
                </div>
            </div>
        );
    }
}
