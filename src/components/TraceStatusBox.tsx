import React from "react";
import RhombusContainer, {RhombusCorner} from "../classes/RhombusContainer";

export default class TraceStatusBox extends React.Component {
    render() {
        return (
            <div className="dx-box trace-status" style={RhombusContainer.getBorderImage({
                corners: [RhombusCorner.TOP_LEFT, RhombusCorner.BOTTOM_RIGHT],
                fgColor: "red"
            })}>
                <div>
                    <div className="trace-status-title">Tracing Alert</div>
                    <div className="trace-status-subtitle">Warning</div>

                </div>
                <div className="trace-status-timer">
                    5.80
                </div>
            </div>
        )
    }
}