import React, {CSSProperties} from "react";
import NodeConnection from "../classes/NodeConnection";
import {condAttr} from "../shared";
import {DEBUG_MODE} from "../index";

interface ConnectionComponentProps {
    conn: NodeConnection;
    nodeWidth: number;
    nodeHeight: number;
    capturePaused: boolean;
}
export default class ConnectionComponent extends React.Component<ConnectionComponentProps> {
    public static readonly CAPTURE_TIME = 500;
    private readonly SHOW_ROTATION_VALUE = DEBUG_MODE && false;

    isLineCaptureReversed(server = false): boolean {
        const {conn} = this.props;
        const captured = conn.from.isCaptured(server) ? conn.from : conn.to;
        return (captured.row > conn.getOtherNode(captured).row);
    }


    render() {
        const {conn, nodeWidth, nodeHeight, capturePaused} = this.props;

        //Calculate box container properties
        let style: CSSProperties = conn.calculateStyles(nodeWidth, nodeHeight);
        const groups = /\((.+?)\)/.exec(style.transform);
        const rotation = groups ? groups[1] : "";

        //Calculate arrow properties
        const styleArrow: CSSProperties = {};
        if (conn.to.row > conn.from.row) {
            //Need to flip arrow
            styleArrow.transform = "rotate(180deg)";
        }

        //Calculate child line properties
        const lineStyles: CSSProperties = {
            animationDuration: `${ConnectionComponent.CAPTURE_TIME}ms`
        };

        return (
            <div className="level-connector"
                 style={style}
                 data-bidi={condAttr(conn.bi)}
                 data-disabled={condAttr(conn.isConnectedToDisabled())}
            >
                <div className="level-connector-line"
                     data-line="user"
                     data-capture={condAttr(conn.captured, conn.captured)}
                     data-reverse={condAttr(this.isLineCaptureReversed())}
                     style={lineStyles}
                    />
                <div className="level-connector-center">
                    {this.SHOW_ROTATION_VALUE &&
                        <span style={{color: "white"}}>{rotation}</span>}
                    {!conn.bi && <div className="level-connector-arrow" style={styleArrow} />}
                </div>
                <div className="level-connector-line"
                     data-line="server"
                     data-capture={condAttr(conn.serverCaptured, conn.serverCaptured)}
                     data-reverse={condAttr(this.isLineCaptureReversed(true))}
                     data-paused={condAttr(capturePaused)}
                     style={lineStyles}
                />
            </div>
        )
    }
}
