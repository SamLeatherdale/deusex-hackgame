import React from "react";
import Player from "../classes/Player";
import {condAttr, TypedObj} from "../shared";
import * as autoBind from "auto-bind";
import {UpgradeType} from "../classes/Upgrade";

interface UpgradesViewProps {
    player: Player;
    updatePlayer: (player: Player, values: TypedObj<any>) => void;
}

export default class UpgradesView extends React.Component<UpgradesViewProps> {
    constructor(props: UpgradesViewProps) {
        super(props);
        autoBind.react(this);
    }

    onUpgrade(type: UpgradeType, level: number) {
        this.props.player.upgrades.get(type).currentLevel = level;
        this.props.updatePlayer(this.props.player, {});
    }

    render() {
        return (
            <div className="upgrade-view">
                {Array.from(this.props.player.upgrades.values()).map(upgrade => (
                    <div key={upgrade.type}
                        className="upgrade-box">
                        <h4 className="upgrade-title">{upgrade.title}</h4>
                        <div className="upgrade-description">
                            {upgrade.currentLevel > 0 &&
                                <p><h5>Current Level:</h5>
                                    {upgrade.getLevelDescription(upgrade.currentLevel)}
                                </p>}
                            {upgrade.currentLevel < upgrade.maxLevel &&
                                <p><h5>Next Level:</h5>
                                    {upgrade.getLevelDescription(upgrade.currentLevel + 1)}
                                </p>}
                        </div>
                        <div className="upgrade-dots">
                        {Array(upgrade.maxLevel).fill(0).map((z, i) => (
                            <div key={`${upgrade.type}-${i}`}
                                className="upgrade-dot"
                                data-filled={condAttr(i <= upgrade.currentLevel - 1)}
                                 onClick={() => this.onUpgrade(upgrade.type, i + 1)}
                            />
                        ))}
                        </div>
                    </div>
                ))}
            </div>
        )
    }
}
