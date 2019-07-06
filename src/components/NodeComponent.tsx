import React from "react";
import LevelNode from "../classes/LevelNode";
import NodeTypeSprite from "../classes/NodeTypeSprite";
import {condAttr, TypedObj} from "../types/shared";
import {NodeType} from "../types/LevelData";

interface NodeComponentProps {
    node: LevelNode;
    updateNode: (key: string, values: TypedObj<any>) => void
}

export default class NodeComponent extends React.Component<NodeComponentProps> {
    constructor(props: NodeComponentProps) {
        super(props)
        this.onClickNode = this.onClickNode.bind(this);
    }

    onClickNode() {
        if (this.props.node.canBeCaptured()) {
            this.props.updateNode(this.props.node.key, {captured: true})
        }
    }

    render() {
        const {node} = this.props;
        const {x, y} = node;
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
                <img src={sprite} alt={node.type} />
            </div>
        );
    }
}
