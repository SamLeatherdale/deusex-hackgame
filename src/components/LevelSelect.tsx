import React from "react";
import LevelData from "../classes/LevelData";

interface LevelSelectProps {
    levels: LevelData[];
    onSelectLevel: (level: LevelData) => void;
}

export default class LevelSelect extends React.Component<LevelSelectProps> {
    render() {
        return (
            <div className='level-select-grid'>
                {this.props.levels.map((level, i) => {
                    return (
                        <div
                            key={i}
                            className='level-select-level dx-button'
                            onClick={() => this.props.onSelectLevel(level)}
                        >
                            <div>{`Level ${i + 1}`}</div>
                            <div>{`Nodes: ${level.nodes.length}`}</div>
                        </div>
                    );
                })}
            </div>
        )
    }
}