import React, {CSSProperties} from "react";
import NodeConnection from "../classes/NodeConnection";
import {condAttr} from "../shared";

interface ConnectionComponentProps {
    conn: NodeConnection;
    nodeWidth: number;
    nodeHeight: number;
}
export default class ConnectionComponent extends React.Component<ConnectionComponentProps> {
    render() {
        const {conn, nodeWidth, nodeHeight} = this.props;

        let style: CSSProperties = conn.calculateStyles(nodeWidth, nodeHeight);

        const styleArrow: CSSProperties = {};
        if (conn.to.row > conn.from.row) {
            //Need to flip arrow
            styleArrow.transform = "rotate(180deg)";
        }

        return (
            <div className="level-connector"
                 style={style}
                 data-bidi={condAttr(conn.bi)}
                 data-disabled={condAttr(conn.isConnectedToDisabled())}
            >
                {!conn.bi && <div className="level-connector-arrow" style={styleArrow} />}
            </div>
        )
    }
}
