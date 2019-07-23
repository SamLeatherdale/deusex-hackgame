import React from "react";
import * as autoBind from "auto-bind";

import Level from "../classes/Level";
import NodeComponent from "./NodeComponent";
import ConnectionComponent from "./ConnectionComponent";
import {NodeSelection, TypedObj} from "../shared";
import LevelNode from "../classes/LevelNode";
import Player from "../classes/Player";

interface LevelGridProps {
    level: Level;
    player: Player;
    server: Player;
    updateLevel: (values: Partial<Level>) => void;
    updateNodes: (node: NodeSelection, values: Partial<LevelNode>) => void;
    updatePlayer: (player: Player, values: TypedObj<any>) => void;
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

    onClickBg(e: React.MouseEvent<HTMLElement, MouseEvent>) {
        this.props.updateNodes(true, {menuOpen: false});
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
                                        level={level}
                                        player={this.props.player}
                                        server={this.props.server}
                                        updateNodes={this.props.updateNodes}
                                        updateLevel={this.props.updateLevel}
                                        updatePlayer={this.props.updatePlayer}
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
