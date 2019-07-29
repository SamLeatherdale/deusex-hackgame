import React, {CSSProperties} from "react";
import RhombusContainer, {RhombusCorner} from "../classes/RhombusContainer";
import * as autoBind from "auto-bind";
import ProgressBar from "./ProgressBar";
import {condAttr, DXBorderColor, msecToSec} from "../shared";
import TimerComponent, {TimerComponentProps, TimerComponentState} from "./TimerComponent";

interface TraceStatusBoxProps extends TimerComponentProps {
}

class TraceStatusBoxState extends TimerComponentState {
}

export default class TraceStatusBox extends TimerComponent<TraceStatusBoxProps, TraceStatusBoxState> {
    private static readonly CRITICAL_TIME_LEFT = 10000;


    warningBorderStyle: CSSProperties;
    criticalBorderStyle: CSSProperties;

    constructor(props: TraceStatusBoxProps) {
        super(props);

        const baseBorder = {
            corners: [RhombusCorner.TOP_LEFT, RhombusCorner.BOTTOM_RIGHT]
        };
        this.warningBorderStyle = RhombusContainer.getBorderImage({
            ...baseBorder,
            fgColor: DXBorderColor
        });
        this.criticalBorderStyle = RhombusContainer.getBorderImage({
            ...baseBorder,
            fgColor: "red"
        });

        autoBind.react(this);
    }

    isCriticalTimeLeft(): boolean {
        return this.getTimeLeft() <= TraceStatusBox.CRITICAL_TIME_LEFT;
    }

    render() {
        return (
            <div className="dx-box trace-status"
                 style={this.isCriticalTimeLeft() ? this.criticalBorderStyle : this.warningBorderStyle}
                 data-critical={condAttr(this.isCriticalTimeLeft())}
            >
                <div className="d-flex">
                    <div className="trace-status-title-box">
                        <div className="trace-status-title">Tracing Alert</div>
                        <div className="trace-status-subtitle">Warning</div>
                    </div>
                    <div className="trace-status-timer">
                        {msecToSec(this.state.timeLeft).toFixed(2)}
                    </div>
                </div>
                <ProgressBar
                    bars={10}
                    barsFilled={Math.ceil(msecToSec(this.getTimeLeft()))}
                />
            </div>
        )
    }
}
