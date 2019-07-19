import React from 'react';
import LevelGrid from "./LevelGrid";
import LevelData, {NodeType} from "../classes/LevelData";
import RhombusContainer, {RhombusCorner} from "../classes/RhombusContainer";
import LevelSelect from "./LevelSelect";
import AllLevelData from "../classes/LevelDataLoader";
import {condAttr, DXBGDefault, DXBGLight, leftPad, NodeSelection, rollTheDice, TypedObj} from "../shared";
import Player from "../classes/Player";
import UpgradesView from "./UpgradesView";
import _ from "lodash";
import * as autoBind from "auto-bind";
import Level, {LevelStatus} from "../classes/Level";
import TraceStatusBox from "./TraceStatusBox";
import LevelNode from "../classes/LevelNode";

export enum AppView {
    LevelGrid,
    LevelSelect,
    Upgrades
}

class AppState {
    currentView: AppView = AppView.LevelGrid;
    level: Level = new Level(Object.values(AllLevelData)[2]);
    player: Player = new Player();
    serverPlayer: Player;
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

    updateNodes(nodes: NodeSelection, values: Partial<LevelNode>): void {
        this.setState(prevState => {
            let updateNodes;
            if (nodes === true) {
                updateNodes = Object.values(this.state.level.nodes);
            } else if (nodes instanceof LevelNode) {
                updateNodes = [nodes];
            }

            for (let node of updateNodes) {
                node.updatePath(values);
            }
            this.updateLevel({});
        })
    }

    updateLevel(values: Partial<Level>): void {
        this.setState(prevState => {
            const level: Level = _.clone(prevState.level);
            level.updatePath(values);

            if (values.isPlayerDetected) {
                this.startEnemyCapturing();
            }

            const newState: any = {};
            newState.level = level;
            return newState;
        })
    }

    onSelectLevel(levelData: LevelData) {
        const level = new Level(levelData);
        this.setState({
            currentView: AppView.LevelGrid,
            level: level,
            serverPlayer: Player.createFromLevel(level)
        });
    }

    changeView(view: AppView) {
        this.setState({currentView: view});
    }

    onLevelComplete(level: Level) {
        //this.setState({levelStatus: level.status});
    }

    onLevelFailed() {
        this.updateLevel({status: LevelStatus.FAILED});
    }

    dismissLevelModal() {
        this.setState({currentView: AppView.LevelSelect});
    }

    startEnemyCapturing() {
        const {level} = this.state;
        const nodes = new Map<string, LevelNode>();
        for (const node of level.getServerNodes()) {
            nodes.set(node.key, node);
        }

        for (const node of nodes.values()) {
            const canBeCaptured = !(node.type === NodeType.SERVER || node.captured);

            if (canBeCaptured) {
                this.captureServerNode(node);
            } else {
                //Add all connected nodes to list
                for (const connNode of node.getConnectedNodes()) {
                    nodes.set(connNode.key, connNode);
                }
            }
        }
    }

    captureServerNode(node: LevelNode) {
        this.updateNodes(node, {serverCapturing: true});

        setTimeout(() => {
            this.updateNodes(node, {
                serverCaptured: true,
                serverCapturing: false
            });

            if (node.type === NodeType.ENTRY) {
                this.updateLevel({status: LevelStatus.FAILED});
            }
        }, node.getCaptureTime(this.state.serverPlayer))
    }

    render() {
        const {currentView, player, level} = this.state;
        const levelStatus = this.state.level.status;

        let view;
        switch (currentView) {
            case AppView.LevelGrid:
                view = <LevelGrid
                            player={player}
                            level={level}
                            updateLevel={this.updateLevel}
                            updateNodes={this.updateNodes}
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
                            player={player}
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
            <div
                id="app-container"
                style={RhombusContainer.getBorderImage({
                    corners: [RhombusCorner.TOP_LEFT, RhombusCorner.BOTTOM_RIGHT]
                })}
            >
                {(currentView === AppView.LevelGrid && levelStatus !== LevelStatus.INCOMPLETE) &&
                <div className="level-modal-bg">
                    <div className="level-modal">
                        <div className="level-modal-body" style={RhombusContainer.getBorderImage({bgColor: DXBGDefault})}>
                            <div className="dx-box dx-box-fill level-modal-title">
                                {levelStatus === LevelStatus.COMPLETE ? "Access Granted" : "Connection Severed"}
                            </div>
                            <p>{levelStatus === LevelStatus.COMPLETE ? "Hacking attempt has succeeded." : "Hacking attempt has failed."}</p>
                        </div>
                        <div className="dx-button"
                             onClick={this.dismissLevelModal}>
                            OK
                        </div>
                    </div>
                </div>}
                <div className="app-view-buttons">
                    {buttonData.map(button => (
                        <div
                            key={button.view}
                            className="dx-button"
                            onClick={() => this.changeView(button.view)}
                            data-active={condAttr(this.state.currentView === button.view)}
                        >
                            {button.title}
                        </div>
                    ))}
                </div>
                {currentView === AppView.LevelGrid &&
                    <div className="app-status-bar">
                        <div className="hack-device">
                            <div>MHD-995 Hacking Device</div>
                            <div className="dx-box" style={RhombusContainer.getBorderImage({
                                corners: [RhombusCorner.BOTTOM_LEFT],
                                bgColor: DXBGLight
                            })}>
                                {level.isPlayerDetected ? "Trace Detected! Evade!" : "Scanning for trace..."}
                            </div>
                        </div>
                        <div className="app-status-bar-right">
                            {level.isPlayerDetected &&
                                <TraceStatusBox time={10} onTimeOut={this.onLevelFailed} />
                            }
                            <div className="dx-box player-item-bar">
                                {Array.from(player.items.values()).map(item => (
                                    <div key={item.type}
                                         className="player-item">
                                        <i className={item.getIcon()}/>
                                        <span className="player-item-count">{leftPad(item.count.toString(), 2, "0")}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                }
                {view}
            </div>
        );
    }
}
