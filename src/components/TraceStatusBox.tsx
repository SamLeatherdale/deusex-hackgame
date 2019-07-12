import React, {CSSProperties} from "react";
import RhombusContainer, {RhombusCorner} from "../classes/RhombusContainer";
import * as autoBind from "auto-bind";

interface TraceStatusBoxProps {
    time: number;
    onTimeOut: () => void;
    paused?: boolean;
}

interface TraceStatusBoxState {
    timeLeft: number;
}

export default class TraceStatusBox extends React.Component<TraceStatusBoxProps, TraceStatusBoxState> {
    borderStyle: CSSProperties;
    tickHandle: number;

    constructor(props: TraceStatusBoxProps) {
        super(props);

        this.state = {
            timeLeft: this.props.time
        };
        this.borderStyle = RhombusContainer.getBorderImage({
            corners: [RhombusCorner.TOP_LEFT, RhombusCorner.BOTTOM_RIGHT],
            fgColor: "red"
        });

        autoBind.react(this);
    }

    /**
     * Updates the warning timer in 10ms increments.
     */
    tick() {
        if (this.props.paused) {
            return;
        }
        this.setState((prevState) => {
            let newTime = prevState.timeLeft - 0.01;
            if (newTime <= 0) {
                newTime = 0;
                clearInterval(this.tickHandle);
            }
            return {timeLeft: newTime};
        });
    }

    componentDidMount(): void {
        this.tickHandle = window.setInterval(this.tick, 10);
    }

    render() {
        return (
            <div className="dx-box trace-status" style={this.borderStyle}>
                <div>
                    <div className="trace-status-title">Tracing Alert</div>
                    <div className="trace-status-subtitle">Warning</div>

                </div>
                <div className="trace-status-timer">
                    {this.state.timeLeft.toFixed(2)}
                </div>
            </div>
        )
    }
}