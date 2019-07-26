import React, {CSSProperties} from "react";
import RhombusContainer, {RhombusCorner} from "../classes/RhombusContainer";
import * as autoBind from "auto-bind";

interface TraceStatusBoxProps {
    time: number; //Time in ms
    interval?: number; //Interval in ms
    onTimeOut?: () => void;
    paused?: boolean;
}

interface TraceStatusBoxState {
    timeLeft: number; //Time in ms
    paused: boolean;
    pauseIntervals: PauseInterval[];
}

class PauseInterval {
    private readonly startTime: number = 0;
    private stopTime: number = 0;

    constructor() {
        this.startTime = new Date().getTime();
    }
    stop() {
        this.stopTime = new Date().getTime();
    }
    isComplete() {
        return this.stopTime > 0;
    }
    getInterval(): number {
        return this.stopTime - this.startTime;
    }
}

export default class TraceStatusBox extends React.Component<TraceStatusBoxProps, TraceStatusBoxState> {
    initialTimeout: number;
    startTimestamp: number;
    borderStyle: CSSProperties;
    tickHandle: number;

    static readonly defaultProps = {
        interval: 10,
        onTimeOut: () => '',
        paused: false
    };

    static getDerivedStateFromProps(nextProps: TraceStatusBoxProps, prevState: TraceStatusBoxState): Partial<TraceStatusBoxState> {
        if (nextProps.paused !== prevState.paused) {
            const pauseIntervals = prevState.pauseIntervals.slice();
            if (nextProps.paused) {
                pauseIntervals.push(new PauseInterval());
            } else if (pauseIntervals.length) {
                const interval = pauseIntervals[pauseIntervals.length - 1];
                interval.stop();
            }

            return {
                pauseIntervals: pauseIntervals,
                paused: nextProps.paused
            }
        }
        return null;
    }


    constructor(props: TraceStatusBoxProps) {
        super(props);

        this.initialTimeout = props.time;
        this.startTimestamp = new Date().getTime();

        this.state = {
            timeLeft: props.time,
            pauseIntervals: [],
            paused: props.paused
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

    getTimeLeft(): number {
        const now = new Date().getTime();
        const realElapsed = now - this.startTimestamp;

        //Subtract any pauses from the elapsed
        const pauseTime = this.state.pauseIntervals.filter(p => p.isComplete()).map(p => p.getInterval()).reduce((sum, t) => sum + t, 0);
        const elapsed = realElapsed - pauseTime;

        return this.props.time - elapsed;
    }

    /**
     * Updates the warning timer, using the frequency specified by the interval.
     */
    tick() {
        if (this.props.paused) {
            return;
        }

        let done = false;

        this.setState((prevState) => {
            let newTime = this.getTimeLeft();
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
                    {(this.state.timeLeft / 1000).toFixed(2)}
                </div>
            </div>
        )
    }
}
