import React, {CSSProperties} from "react";
import RhombusContainer, {RhombusCorner} from "../classes/RhombusContainer";
import * as autoBind from "auto-bind";

interface TraceStatusBoxProps {
    time: number;
    interval?: number;
    onTimeOut?: () => void;
    paused?: boolean;
}

interface TraceStatusBoxState {
    timeLeft: number;
}

export default class TraceStatusBox extends React.Component<TraceStatusBoxProps, TraceStatusBoxState> {
    borderStyle: CSSProperties;
    tickHandle: number;

    static readonly defaultProps = {
        interval: 10,
        onTimeOut: () => '',
        paused: false
    };

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

    unregisterInterval() {
        if (typeof this.tickHandle !== "undefined") {
            clearInterval(this.tickHandle);
        }
        this.tickHandle = undefined;
    }

    /**
     * Updates the warning timer in 10ms increments.
     */
    tick() {
        if (this.props.paused) {
            return;
        }

        let done = false;

        this.setState((prevState) => {
            let newTime = prevState.timeLeft - this.props.interval / 1000;
            if (newTime <= 0) {
                newTime = 0;
                done = true;
            }
            return {timeLeft: newTime};
        }, () => {
            if (done) {
                this.unregisterInterval();
                this.props.onTimeOut();
            }
        });
    }

    componentDidMount(): void {
        this.tickHandle = window.setInterval(this.tick, this.props.interval);
    }

    componentWillUnmount(): void {
        this.unregisterInterval();
    }

    render() {
        return (
            <div className="dx-box trace-status" style={this.borderStyle}>
                <div className="trace-status-title-box">
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