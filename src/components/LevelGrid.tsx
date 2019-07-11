import React from "react";
import _ from "lodash";
import * as autoBind from "auto-bind";

import Level, {LevelStatus} from "../classes/Level";
import LevelData from "../classes/LevelData";
import NodeComponent from "./NodeComponent";
import ConnectionComponent from "./ConnectionComponent";
import {NodeSelection, TypedObj} from "../shared";
import LevelNode from "../classes/LevelNode";
import Player from "../classes/Player";
import RhombusContainer, {RhombusCorner} from "./RhombusContainer";

interface LevelGridProps {
    levelData: LevelData;
    player: Player;
    onLevelComplete: (level: Level) => void;
}

interface LevelGridState {
    level: Level;
}

export default class LevelGrid extends React.Component<LevelGridProps, LevelGridState> {
    NODE_WIDTH = 200;
    NODE_HEIGHT = 200;

    constructor(props: LevelGridProps) {
        super(props);
        this.state = {
            level: new Level(this.props.levelData)
        };

        autoBind.react(this);
    }

    updateNode(node: LevelNode, values: TypedObj<any>): void {
        this.updateNodes(node, values);
    }

    updateNodes(nodes: NodeSelection, values: Partial<LevelNode>): void {
        this.setState(prevState => {
            const level: Level = _.clone(prevState.level);

            let updateNodes;
            if (nodes === true) {
                updateNodes = Object.values(this.state.level.nodes);
            } else if (nodes instanceof LevelNode) {
                updateNodes = [nodes];
            }

            for (let node of updateNodes) {
                node.updatePath(values);
            }

            const newState: any = {};
            newState.level = level;
            return newState;
        })
    }

    updateLevel(values: Partial<Level>): void {
        this.setState(prevState => {
            const level: Level = _.clone(prevState.level);

            level.updatePath(values);

            if (typeof values.status !== "undefined") {
                this.props.onLevelComplete(level);
            }

            const newState: any = {};
            newState.level = level;
            return newState;
        })
    }

    onClickBg(e: React.MouseEvent<HTMLElement, MouseEvent>) {
        const target = e.target;
        this.updateNodes(true, {menuOpen: false});
    }

    render() {
        const {level} = this.state;

        return (
            <div className="level-container" onClick={this.onClickBg}>
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
                                    updateLevel={this.updateLevel}
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
        )
    }
}
