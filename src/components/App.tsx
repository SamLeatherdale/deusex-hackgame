import React from 'react';
import _ from "lodash";
import * as autoBind from "auto-bind";
import {PanZoom} from "react-easy-panzoom";

import LevelGrid from "./LevelGrid";
import LevelData, {NodeType} from "../classes/LevelData";
import RhombusContainer, {RhombusCorner} from "../classes/RhombusContainer";
import LevelSelect from "./LevelSelect";
import AllLevelData from "../classes/LevelDataLoader";
import {CaptureStatus, condAttr, DXBGDefault, DXBGLight, leftPad, NodeSelection, TypedObj} from "../shared";
import Player from "../classes/Player";
import UpgradesView from "./UpgradesView";
import Level, {LevelStatus} from "../classes/Level";
import TraceStatusBox from "./TraceStatusBox";
import LevelNode from "../classes/LevelNode";
import ConnectionComponent from "./ConnectionComponent";
import {delay} from "q";

export enum AppView {
    LevelGrid = "grid",
    LevelSelect = "select",
    Upgrades = "upgrade"
}

class AppState {
    currentView: AppView = AppView.LevelGrid;
    level: Level;
    player: Player = new Player();
    server: Player;
}

interface AppViewButton {
    title: string;
    view: AppView;
}

export default class App extends React.Component<{}, AppState> {
    static readonly defaultLevel = 2;

    constructor(props) {
        super(props);
        this.state = new AppState();
        autoBind.react(this);

        if (this.state.currentView === AppView.LevelGrid) {
            //We must initialize properly
            Object.assign(this.state,
                App.getLevelState(Object.values(AllLevelData)[App.defaultLevel]));

        }
    }

    static getLevelState(levelData: LevelData) {
        const level = new Level(levelData);
        return {
            currentView: AppView.LevelGrid,
            level: level,
            server: Player.createFromLevel(level)
        }
    }

    isLevelGridView() {
        return this.state.currentView === AppView.LevelGrid;
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
    }

    updateLevel(values: Partial<Level>): void {
        this.setState(prevState => {
            const level: Level = _.clone(prevState.level);
            level.updatePath(values);

            const newState: any = {};
            newState.level = level;
            return newState;
        }, () => {
            //Must happen in callback, as setState must be a pure function
            if (values.isPlayerDetected) {
                this.startEnemyCapturing();
            }
        })
    }

    onSelectLevel(levelData: LevelData) {
        this.setState(App.getLevelState(levelData));
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

    dismissLevelModal(): void {
        this.setState({currentView: AppView.LevelSelect});
    }

    startEnemyCapturing(): void {
        const {level} = this.state;
        this.onCaptureServerNode(...level.getNodesByType(NodeType.SERVER));
    }

    /**
     * Starts capturing the adjacent nodes to the provided just-captured nodes.
     * @param startNodes
     */
    onCaptureServerNode(...startNodes: LevelNode[]): void {
        const {status} = this.state.level;
        if (status !== LevelStatus.INCOMPLETE) {
            return;
        }

        const nodes = new Map<string, LevelNode>();
        for (const node of startNodes) {
            nodes.set(node.key, node);
        }

        for (const node of nodes.values()) {
            const canBeCaptured = !(node.type === NodeType.SERVER || node.isCaptured(true));

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

    captureServerNode(node: LevelNode): void {
        //Find connection(s) to this node
        const conns = node.getActiveConnectionsToNode(true);
        conns.forEach(conn => conn.serverCaptured = CaptureStatus.CAPTURING);
        this.setState({});

        //Wait for connection animation to complete
        delay(ConnectionComponent.CAPTURE_TIME)
        .then(() => {
            conns.forEach(conn => conn.serverCaptured = CaptureStatus.CAPTURED);

            this.updateNodes(node, {serverCaptured: CaptureStatus.CAPTURING});

            //Wait for node capturing animation to complete
            return delay(node.getCaptureTime(this.state.server));
        }).then(() => {
            this.updateNodes(node, {
                serverCaptured: CaptureStatus.CAPTURED
            });

            //We don't want to override level being completed
            if (this.state.level.isComplete()) {
                return;
            }

            if (node.type === NodeType.ENTRY) {
                this.updateLevel({status: LevelStatus.FAILED});
            } else {
                this.onCaptureServerNode(node);
            }
        });
    }

    /**
     * Helper for PanZoom component. If panning should be prevented, returns true.
     * @param event MouseEvent generated by the pan.
     * @param x
     * @param y
     */
    static preventPan(event: MouseEvent, x: number, y: number): boolean {
        const target = event.target as HTMLElement;
        const disableChildren = ['.node-menu'];

        for (const selector of disableChildren) {
            const els = document.querySelectorAll(selector);
            for (const el of els) {
                if (el.contains(target)) {
                    return true;
                }
            }
        }
        return false;
    }

    render() {
        const {currentView, player, level, server} = this.state;
        const levelStatus = this.state.level.status;

        let view;
        switch (currentView) {
            case AppView.LevelGrid:
                view =
                <PanZoom
                    autoCenter={false}
                    disableDoubleClickZoom={true}
                    className="level-pan-container"
                    preventPan={App.preventPan}>
                    <LevelGrid
                        level={level}
                        player={player}
                        server={server}
                        updateLevel={this.updateLevel}
                        updateNodes={this.updateNodes}
                        updatePlayer={this.updatePlayer}
                    />
                </PanZoom>;
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

        const appBorderProps = {
            corners: [RhombusCorner.TOP_LEFT, RhombusCorner.BOTTOM_RIGHT],
            mask: true
        };
        const showAlert = this.isLevelGridView() && !level.isComplete() && level.isPlayerDetected;
        const showModal = this.isLevelGridView() && level.isComplete();

        return (
            <div
                id="app-container"
                style={RhombusContainer.getBorderImage(appBorderProps)}
            >
                {showAlert && <div className="level-alert" />}
                {showModal &&
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
                    <div className="app-status-bar"
                        data-floating={condAttr(this.isLevelGridView())}>
                        <div className="hack-device">
                            <div className="hack-device-title">MHD-995 Hacking Device</div>
                            <div className="dx-box" style={RhombusContainer.getBorderImage({
                                corners: [RhombusCorner.BOTTOM_LEFT],
                                bgColor: DXBGLight
                            })}>
                                {level.isPlayerDetected ? "Trace Detected! Evade!" : "Scanning for trace..."}
                            </div>
                        </div>
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
                        <div className="app-status-bar-right">
                            {level.isPlayerDetected &&
                            <TraceStatusBox
                                time={10}
                                paused={level.isComplete()}
                                //onTimeOut={this.onLevelFailed}
                            />
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
                {view}
            </div>
        );
    }
}
