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

export enum AppView {
    LevelGrid,
    LevelSelect,
    Upgrades
}

class AppState {
    currentView: AppView = AppView.LevelGrid;
    level: Level = new Level(Object.values(AllLevelData)[2]);
    player: Player = new Player();
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

    updateLevel(values: Partial<Level>): void {
        this.setState(prevState => {
            const level: Level = _.clone(prevState.level);
            level.updatePath(values);

            const newState: any = {};
            newState.level = level;
            return newState;
        })
    }

    onSelectLevel(level: LevelData) {
        this.setState({
            currentView: AppView.LevelGrid,
            level: new Level(level)
        });
    }

    changeView(view: AppView) {
        this.setState({currentView: view});
    }

    onLevelComplete(level: Level) {
        //this.setState({levelStatus: level.status});
    }

    dismissLevelModal() {
        this.setState({currentView: AppView.LevelSelect});
    }

    render() {
        const {currentView, player} = this.state;
        const levelStatus = this.state.level.status;

        let view;
        switch (currentView) {
            case AppView.LevelGrid:
                view = <LevelGrid
                            player={this.state.player}
                            level={this.state.level}
                            updateLevel={this.updateLevel}
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
                {(currentView === AppView.LevelGrid && levelStatus !== LevelStatus.INCOMPLETE) &&
                <div className="level-modal-bg">
                    <div className="level-modal">
                        <RhombusContainer className="level-modal-body">
                            <RhombusContainer className="level-modal-title">
                                {levelStatus === LevelStatus.COMPLETE ? "Access Granted" : "Connection Severed"}
                            </RhombusContainer>
                            <p>{levelStatus === LevelStatus.COMPLETE ? "Hacking attempt has succeeded." : "Hacking attempt has failed."}</p>
                        </RhombusContainer>
                        <RhombusContainer className="dx-button"
                                          props={{onClick: this.dismissLevelModal}}>
                            OK
                        </RhombusContainer>
                    </div>
                </div>}
                <div className="app-view-buttons">
                    <div className="app-status-bar">
                        <div className="hack-device">
                            <div>MHD-995 Hacking Device</div>
                            <RhombusContainer className="dx-box" corners={[RhombusCorner.BOTTOM_LEFT]}>
                                Scanning for trace...
                            </RhombusContainer>
                        </div>
                        <div>
                            <RhombusContainer className="dx-box player-item-bar">
                                {Array.from(player.items.values()).map(item => (
                                    <div className="player-item">
                                        <i className={item.getIcon()} />
                                        <span className="player-item-count">{item.count}</span>
                                    </div>
                                ))}
                            </RhombusContainer>
                        </div>
                    </div>
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
