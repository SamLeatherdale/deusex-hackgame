import React from "react";
import Level from "../classes/Level";
import LevelData from "../types/LevelData";
import NodeComponent from "./NodeComponent";
import ConnectionComponent from "./ConnectionComponent";

interface LevelComponentProps {
    levelData: LevelData;
}

interface LevelComponentState {
    level: Level;
}

export default class LevelComponent extends React.Component<LevelComponentProps, LevelComponentState> {
    NODE_WIDTH = 150;
    NODE_HEIGHT = 150;

    constructor(props: LevelComponentProps) {
        super(props);
        this.state = {
            level: new Level(this.props.levelData)
        };
    }

    render() {

        return (
            <div className="level-container">
                <div className="level-grid" style={{
                    display: "grid",
                    gridTemplateRows: `repeat(${this.state.level.getRowCount() + 1}, ${this.NODE_HEIGHT}px)`,
                    gridTemplateColumns: `repeat(${this.state.level.getColCount() + 1}, ${this.NODE_WIDTH}px)`
                }}>
                    {Object.values(this.state.level.nodes).map(node => {
                        return <NodeComponent key={node.key} node={node} />
                    })}
                </div>
            {this.state.level.connections.map(conn => {
                return <ConnectionComponent
                            conn={conn}
                            nodeWidth={this.NODE_WIDTH}
                            nodeHeight={this.NODE_HEIGHT} />
            })}
            </div>
        )
    }
}