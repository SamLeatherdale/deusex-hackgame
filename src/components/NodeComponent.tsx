import React, {CSSProperties} from "react";
import LevelNode from "../classes/LevelNode";
import NodeTypeSprite from "../classes/NodeTypeSprite";
import {condAttr, NodeSelection, TypedObj} from "../types/shared";
import {NodeType} from "../types/LevelData";
import NodeMenu, {NodeMenuAction} from "./NodeMenu";

interface NodeComponentProps {
    node: LevelNode;
    updateNodes: (node: NodeSelection, values: Partial<LevelNode>) => void
}

class NodeComponentState {
    capturing: boolean = false;
}

export default class NodeComponent extends React.Component<NodeComponentProps, NodeComponentState> {
    constructor(props: NodeComponentProps) {
        super(props);
        this.state = new NodeComponentState();

        this.onClickNode = this.onClickNode.bind(this);
        this.onNodeMenuAction = this.onNodeMenuAction.bind(this);
        this.captureNode = this.captureNode.bind(this);
        this.nukeNode = this.nukeNode.bind(this);
        this.stopNode = this.stopNode.bind(this);
        this.fortifyNode = this.fortifyNode.bind(this);
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
        if (this.props.node.canBeCaptured()) {
            this.props.updateNodes(this.props.node, {menuOpen: false});
            this.setState({capturing: true});

            setTimeout(() => {
                this.props.updateNodes(this.props.node, {captured: true});
            }, this.props.node.getCaptureTime())
        }
    }

    nukeNode() {

    }

    stopNode() {

    }

    fortifyNode() {

    }

    render() {
        const {node} = this.props;
        const {x, y, menuOpen} = node;

        const sprite = NodeTypeSprite.getSprite(node.type);
        const spriteUrl = `url("${sprite}")`;
        const backgroundStyle: CSSProperties = {
            backgroundImage: spriteUrl,
        };
        const maskStyle: CSSProperties = {
            mask: spriteUrl,
            WebkitMaskImage: spriteUrl,
            animationDuration: `${this.props.node.getCaptureTime()}ms`
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
                                  onNodeMenuAction={this.onNodeMenuAction} />}
                    <div className="level-node-mask"
                         data-capturing={condAttr(this.state.capturing)}
                         data-captured={condAttr(node.appearsCaptured())}
                         style={maskStyle} />
                    <div className="level-node-img" style={backgroundStyle} />
                    <div className="level-node-level-text">{this.props.node.level}</div>
                </div>
            </div>
        );
    }
}
