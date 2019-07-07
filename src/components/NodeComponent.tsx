import React from "react";
import LevelNode from "../classes/LevelNode";
import NodeTypeSprite from "../classes/NodeTypeSprite";
import {condAttr, TypedObj} from "../types/shared";
import {NodeType} from "../types/LevelData";
import NodeMenu from "./NodeMenu";

interface NodeComponentProps {
    node: LevelNode;
    updateNode: (node: LevelNode, values: TypedObj<any>) => void
}

export default class NodeComponent extends React.Component<NodeComponentProps> {
    constructor(props: NodeComponentProps) {
        super(props);
        this.onClickNode = this.onClickNode.bind(this);
    }

    onClickNode() {
        if (!this.props.node.isDisabled()) {
            this.props.updateNode(this.props.node, {menuOpen: true})
        }
    }

    render() {
        const {node} = this.props;
        const {x, y, menuOpen} = node;
        const sprite = NodeTypeSprite.getSprite(node.type);
        const backgroundStyle = {
            backgroundImage: `url("${sprite}")`,
        };

        return (
            <div className="level-node"
                 onClick={this.onClickNode}
                 data-disabled={condAttr(node.isDisabled())}
                 data-captured={condAttr(node.appearsCaptured())}
                 style={{
                    gridColumn: `${x + 1} / span 1`,
                    gridRow: `${y + 1} / span 1`,
                }}>
                {menuOpen && <NodeMenu node={node} updateNode={this.props.updateNode} />}
                <img src={sprite} alt={node.type} />
            </div>
        );
    }
}
