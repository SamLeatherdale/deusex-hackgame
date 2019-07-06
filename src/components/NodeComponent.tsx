import React from "react";
import LevelNode from "../classes/LevelNode";
import NodeTypeSprite from "../classes/NodeTypeSprite";

interface NodeComponentProps {
    node: LevelNode;
}

export default class NodeComponent extends React.Component<NodeComponentProps> {
    render() {
        const {x, y} = this.props.node;
        const sprite = NodeTypeSprite.getSprite(this.props.node.type);
        const backgroundStyle = {
            backgroundImage: `url("${sprite}")`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
        };

        return (
            <div className="level-node" style={{
                gridColumn: `${x + 1} / span 1`,
                gridRow: `${y + 1} / span 1`,
            }}>
                <img src={sprite} alt={this.props.node.type} />
            </div>
        );
    }
}