import React from 'react';
import LevelGrid from "./LevelGrid";
import LevelData from "../classes/LevelData";
import RhombusContainer, {RhombusCorner} from "./RhombusContainer";
import LevelSelect from "./LevelSelect";
import AllLevelData from "../classes/LevelDataLoader";
import {condAttr} from "../shared";

class AppState {
    currentView: AppView = AppView.LevelSelect;
    currentLevel: LevelData;
}

enum AppView {
    LevelGrid,
    LevelSelect
}

interface AppViewButton {
    title: string;
    view: AppView;
}

export default class App extends React.Component<{}, AppState> {
    constructor(props) {
        super(props);
        this.state = new AppState();

        this.onSelectLevel = this.onSelectLevel.bind(this);
    }

    onSelectLevel(level: LevelData) {
        this.setState({
            currentView: AppView.LevelGrid,
            currentLevel: level
        });
    }

    onClickViewButton(view: AppView) {
        this.setState({currentView: view});
    }

    render() {
        const {currentView} = this.state;

        let view;
        switch (currentView) {
            case AppView.LevelGrid:
                view = <LevelGrid levelData={this.state.currentLevel} />;
                break;
            case AppView.LevelSelect:
                view = <LevelSelect
                            levels={Object.values(AllLevelData)}
                            onSelectLevel={this.onSelectLevel}
                        />;
                break;
        }

        const buttonData: AppViewButton[] = [
            {
                title: "Levels",
                view: AppView.LevelSelect
            }
        ];

        return (
            <RhombusContainer
                id="app-container"
                corners={[RhombusCorner.TOP_LEFT, RhombusCorner.BOTTOM_RIGHT]}
            >
                <div className="app-view-buttons">
                    {buttonData.map(button => (
                        <RhombusContainer
                            key={button.view}
                            className="dx-button"
                            corners={[RhombusCorner.TOP_RIGHT, RhombusCorner.BOTTOM_LEFT]}
                            props={{
                                onClick: () => this.onClickViewButton(button.view),
                                "data-active": condAttr(this.state.currentView === button.view)
                            }}
                        >
                            {button.title}
                        </RhombusContainer>
                    ))}
                </div>
                {view}
            </RhombusContainer>
        );
    }
}
