import React from 'react';
import LevelGrid from "./LevelGrid";
import LevelData from "../classes/LevelData";
import level2 from "../assets/levels/2.json";
import RhombusContainer, {RhombusCorner} from "./RhombusContainer";

class AppState {
    currentView: AppView = AppView.LevelGrid;
}

enum AppView {
    LevelGrid,
    LevelSelect
}

export default class App extends React.Component<{}, AppState> {
    constructor(props) {
        super(props);
        this.state = new AppState();
    }
    render() {
        const {currentView} = this.state;

        let view;
        switch (currentView) {
            case AppView.LevelGrid:
                view = <LevelGrid levelData={level2 as unknown as LevelData}/>;
                break;
            case AppView.LevelSelect:
                view = "";
                break;
        }

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
                    {view}
                </RhombusContainer>
            </div>
        );
    }
}
