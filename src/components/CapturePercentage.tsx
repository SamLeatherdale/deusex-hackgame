import React from "react";
import TimerComponent, {TimerComponentProps, TimerComponentState} from "./TimerComponent";

interface CapturePercentageProps extends TimerComponentProps {

}
class CapturePercentageState extends TimerComponentState {

}

export default class CapturePercentage extends TimerComponent<CapturePercentageProps, CapturePercentageState> {

    render() {
        return (
            <div className="node-capture-percent">
                {Math.floor(this.getElapsedTime() / this.props.time * 100)}%
            </div>
        )
    }
}