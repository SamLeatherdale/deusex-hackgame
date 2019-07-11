import React from "react";
import * as autoBind from "auto-bind";

import Level from "../classes/Level";
import NodeComponent from "./NodeComponent";
import ConnectionComponent from "./ConnectionComponent";
import {NodeSelection} from "../shared";
import LevelNode from "../classes/LevelNode";
import Player from "../classes/Player";
import RhombusContainer, {RhombusCorner} from "./RhombusContainer";

interface LevelGridProps {
    level: Level;
    player: Player;
    updateLevel: (values: Partial<Level>) => void;
}

class LevelGridState {

}

export default class LevelGrid extends React.Component<LevelGridProps, LevelGridState> {
    NODE_WIDTH = 200;
    NODE_HEIGHT = 200;

    constructor(props: LevelGridProps) {
        super(props);
        this.state = new LevelGridState();

        autoBind.react(this);
    }

    updateNodes(nodes: NodeSelection, values: Partial<LevelNode>): void {
        this.setState(prevState => {
            let updateNodes;
            if (nodes === true) {
                updateNodes = Object.values(this.props.level.nodes);
            } else if (nodes instanceof LevelNode) {
                updateNodes = [nodes];
            }

            for (let node of updateNodes) {
                node.updatePath(values);
            }
            this.props.updateLevel({});
        })
    }

    onClickBg(e: React.MouseEvent<HTMLElement, MouseEvent>) {
        this.updateNodes(true, {menuOpen: false});
    }

    render() {
        const {level} = this.props;

        return (
            <div className="level-container" onClick={this.onClickBg}>
                <div className="level-grid-container">
                    <div className="level-grid" style={{
                        display: "grid",
                        gridTemplateRows: `repeat(${level.getRowCount() + 1}, ${this.NODE_HEIGHT}px)`,
                        gridTemplateColumns: `repeat(${level.getColCount() + 1}, ${this.NODE_WIDTH}px)`
                    }}>
                        {Object.values(level.nodes).map(node => {
                            return <NodeComponent
                                        key={node.key}
                                        node={node}
                                        player={this.props.player}
                                        updateNodes={this.updateNodes}
                                        updateLevel={this.props.updateLevel}
                            />
                        })}
                    </div>
                    <div className="level-connector-container">
                        {level.connections.map(conn => {
                            return <ConnectionComponent
                                        key={`${conn.from.key}_${conn.to.key}`}
                                        conn={conn}
                                        nodeWidth={this.NODE_WIDTH}
                                        nodeHeight={this.NODE_HEIGHT} />
                        })}
                    </div>
                </div>
            </div>
        )
    }
}
