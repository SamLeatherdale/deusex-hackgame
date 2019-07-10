import React from "react";
import LevelData from "../classes/LevelData";
import RhombusContainer, {RhombusCorner} from "./RhombusContainer";

interface LevelSelectProps {
    levels: LevelData[];
    onSelectLevel: (level: LevelData) => void;
}

export default class LevelSelect extends React.Component<LevelSelectProps> {
    render() {
        console.log(this.props.levels);

        return (
            <div className='level-select-grid'>
                {this.props.levels.map((level, i) => {
                    return (
                        <RhombusContainer
                            key={i}
                            corners={[RhombusCorner.TOP_RIGHT, RhombusCorner.BOTTOM_LEFT]}
                            offset={-3}
                            className={'level-select-level'}
                            props={{onClick: () => this.props.onSelectLevel(level)}}
                        >
                            <div>{`Level ${i + 1}`}</div>
                            <div>{`Nodes: ${level.nodes.length}`}</div>
                        </RhombusContainer>
                    );
                })}
            </div>
        )
    }
}