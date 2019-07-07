import React from "react";
import Level from "../classes/Level";
import LevelData from "../types/LevelData";
import NodeComponent from "./NodeComponent";
import ConnectionComponent from "./ConnectionComponent";
import {TypedObj} from "../types/shared";
import _ from "lodash";
import LevelNode from "../classes/LevelNode";

interface LevelComponentProps {
    levelData: LevelData;
}

interface LevelComponentState {
    level: Level;
}

export default class LevelComponent extends React.Component<LevelComponentProps, LevelComponentState> {
    NODE_WIDTH = 200;
    NODE_HEIGHT = 200;

    constructor(props: LevelComponentProps) {
        super(props);
        this.state = {
            level: new Level(this.props.levelData)
        };

        this.updateNode = this.updateNode.bind(this);
        this.updateNodes = this.updateNodes.bind(this);
    }

    /**
     * Update a single group with the given key, and an object of values.
     * @param node
     * @param values
     */
    updateNode(node: LevelNode, values: TypedObj<any>): void {
        this.updateNodes({[node.key]: values});
    }

    /**
     * Update many groups, using a mapping of group key => an object of values.
     */
    updateNodes(nodeUpdates: TypedObj<any>): void {
        this.setState(prevState => {
            const level: Level = _.clone(prevState.level);

            for (let key of Object.keys(nodeUpdates)) {
                level.getNodeKey(key).updatePath(nodeUpdates[key]);
            }

            const newState: any = {};
            newState.level = level;
            return newState;
        })
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
                        return <NodeComponent
                                    key={node.key}
                                    node={node}
                                    updateNode={this.updateNode} />
                    })}
                </div>
                <div className="level-connector-container">
                    {this.state.level.connections.map(conn => {
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
