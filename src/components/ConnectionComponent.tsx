import React, {CSSProperties} from "react";
import NodeConnection from "../classes/NodeConnection";
import {condAttr} from "../shared";

interface ConnectionComponentProps {
    conn: NodeConnection;
    nodeWidth: number;
    nodeHeight: number;
}
export default class ConnectionComponent extends React.Component<ConnectionComponentProps> {
    private static SHOW_ROTATION_VALUE = true;

    render() {
        const {conn, nodeWidth, nodeHeight} = this.props;

        let style: CSSProperties = conn.calculateStyles(nodeWidth, nodeHeight);
        const groups = /\((.+?)\)/.exec(style.transform);
        const rotation = groups ? groups[1] : "";

        const styleArrow: CSSProperties = {};
        if (conn.to.row > conn.from.row) {
            //Need to flip arrow
            styleArrow.transform = "rotate(180deg)";
        }

        let reverseCapturing = false;
        const captured = conn.from.captured ? conn.from : conn.to;
        if (captured.row > conn.getOtherNode(captured).row) {
            reverseCapturing = true;
        }

        return (
            <div className="level-connector"
                 style={style}
                 data-bidi={condAttr(conn.bi)}
                 data-disabled={condAttr(conn.isConnectedToDisabled())}
                 data-capturing={condAttr(conn.capturing, reverseCapturing ? "reverse" : "normal")}
            >
                {ConnectionComponent.SHOW_ROTATION_VALUE &&
                    <span style={{color: "white"}}>{rotation}</span>}
                {!conn.bi && <div className="level-connector-arrow" style={styleArrow} />}
            </div>
        )
    }
}
