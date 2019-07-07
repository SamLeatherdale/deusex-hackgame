import React from 'react';
import LevelComponent from "./LevelComponent";
import LevelData from "../types/LevelData";
import level2 from "../assets/levels/2.json";
import RhombusContainer, {RhombusCorner} from "./RhombusContainer";

export default class App extends React.Component {
    render() {
        return (
            <div id="app-container">
                <RhombusContainer
                    corners={[RhombusCorner.TOP_LEFT, RhombusCorner.BOTTOM_RIGHT]}
                    width={20}
                    height={20}
                    offset={-3}
                    bgColor={"black"}
                    fgColor={"#eca723"}
                >
                    <LevelComponent levelData={level2 as unknown as LevelData}/>
                </RhombusContainer>
            </div>
        );
    }
}
