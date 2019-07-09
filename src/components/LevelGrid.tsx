import React from "react";
import Level from "../classes/Level";
import LevelData from "../classes/LevelData";
import NodeComponent from "./NodeComponent";
import ConnectionComponent from "./ConnectionComponent";
import {NodeSelection, TypedObj} from "../shared";
import _ from "lodash";
import LevelNode from "../classes/LevelNode";

interface LevelGridProps {
    levelData: LevelData;
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

        this.updateNode = this.updateNode.bind(this);
        this.updateNodes = this.updateNodes.bind(this);
        this.onClickBg = this.onClickBg.bind(this);
    }

    /**
     * Update a single group with the given key, and an object of values.
     * @param node
     * @param values
     */
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

    onClickBg(e: React.MouseEvent<HTMLElement, MouseEvent>) {
        const target = e.target;
        this.updateNodes(true, {menuOpen: false});
    }

    render() {

        return (
            <div className="level-container" onClick={this.onClickBg}>
                <div className="level-grid" style={{
                    display: "grid",
                    gridTemplateRows: `repeat(${this.state.level.getRowCount() + 1}, ${this.NODE_HEIGHT}px)`,
                    gridTemplateColumns: `repeat(${this.state.level.getColCount() + 1}, ${this.NODE_WIDTH}px)`
                }}>
                    {Object.values(this.state.level.nodes).map(node => {
                        return <NodeComponent
                                    key={node.key}
                                    node={node}
                                    updateNodes={this.updateNodes} />
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
