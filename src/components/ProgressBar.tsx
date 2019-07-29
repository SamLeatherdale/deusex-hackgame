import React from "react";
import {condAttr, DXBGLight} from "../shared";

interface ProgressBarProps {
    bars: number;
    barsFilled?: number;
}

export default class ProgressBar extends React.Component<ProgressBarProps> {
    static defaultProps = {
        barsFilled: 0,
        fillColor: DXBGLight
    };

    render() {
        const {bars, barsFilled} = this.props;

        return (
            <ul className="progress-bar">
                {Array.from(Array(bars).keys()).map(i => (
                    <li key={i}
                        data-filled={condAttr(i < barsFilled)}
                    />
                ))}
            </ul>
        );
    }

}