import React from 'react';
import LevelGrid from "./LevelGrid";
import LevelData from "../classes/LevelData";
import RhombusContainer, {RhombusCorner} from "./RhombusContainer";
import LevelSelect from "./LevelSelect";
import AllLevelData from "../classes/LevelDataLoader";
import {condAttr, TypedObj} from "../shared";
import Player from "../classes/Player";
import UpgradesView from "./UpgradesView";
import _ from "lodash";
import * as autoBind from "auto-bind";
import Level, {LevelStatus} from "../classes/Level";

class AppState {
    currentView: AppView = AppView.LevelGrid;
    currentLevel: LevelData = Object.values(AllLevelData)[0];
    levelStatus: LevelStatus = LevelStatus.INCOMPLETE;
    player: Player = new Player();
}

export enum AppView {
    LevelGrid,
    LevelSelect,
    Upgrades
}

interface AppViewButton {
    title: string;
    view: AppView;
}

export default class App extends React.Component<{}, AppState> {
    constructor(props) {
        super(props);
        this.state = new AppState();

        autoBind.react(this);
    }

    updatePlayer(player: Player, values: TypedObj<any>): void {
        this.setState(prevState => {
            const player: Player = _.clone(prevState.player);

            player.updatePath(values);

            const newState: any = {};
            newState.player = player;
            return newState;
        })
    }

    onSelectLevel(level: LevelData) {
        this.setState({
            currentView: AppView.LevelGrid,
            currentLevel: level
        });
    }

    changeView(view: AppView) {
        this.setState({currentView: view});
    }

    onLevelComplete(level: Level) {
        this.setState({levelStatus: level.status});
    }

    render() {
        const {currentView} = this.state;

        let view;
        switch (currentView) {
            case AppView.LevelGrid:
                view = <LevelGrid
                            player={this.state.player}
                            levelData={this.state.currentLevel}
                            onLevelComplete={this.onLevelComplete}
                        />;
                break;
            case AppView.LevelSelect:
                view = <LevelSelect
                            levels={Object.values(AllLevelData)}
                            onSelectLevel={this.onSelectLevel}
                        />;
                break;
            case AppView.Upgrades:
                view = <UpgradesView
                            player={this.state.player}
                            updatePlayer={this.updatePlayer} />;
                break;
        }

        const buttonData: AppViewButton[] = [
            {
                title: "Levels",
                view: AppView.LevelSelect
            },
            {
                title: "Augs",
                view: AppView.Upgrades
            }
        ];

        return (
            <RhombusContainer
                id="app-container"
                corners={[RhombusCorner.TOP_LEFT, RhombusCorner.BOTTOM_RIGHT]}
            >
                {this.state.levelStatus !== LevelStatus.INCOMPLETE &&
                <div className="level-modal-bg">
                    <RhombusContainer className="level-modal">
                        <RhombusContainer className="level-modal-title">
                            Access Granted
                        </RhombusContainer>
                        <RhombusContainer className="dx-button"
                                          props={{onClick: () => this.changeView(AppView.LevelSelect)}}>
                            OK
                        </RhombusContainer>
                    </RhombusContainer>
                </div>}
                <div className="app-view-buttons">
                    {buttonData.map(button => (
                        <RhombusContainer
                            key={button.view}
                            className="dx-button"
                            corners={[RhombusCorner.TOP_RIGHT, RhombusCorner.BOTTOM_LEFT]}
                            props={{
                                onClick: () => this.changeView(button.view),
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
