import React, {CSSProperties} from "react";
import NodeConnection from "../classes/NodeConnection";

interface ConnectionComponentProps {
    conn: NodeConnection;
    nodeWidth: number;
    nodeHeight: number;
}
export default class ConnectionComponent extends React.Component<ConnectionComponentProps> {
    render() {
        const {conn, nodeWidth, nodeHeight} = this.props;
        let style: CSSProperties = {
            ...conn.calculateStyles(nodeWidth, nodeHeight),
            position: "absolute",
            width: "1px",
            borderLeftWidth: "1px",
            borderColor: "white",
            borderLeftStyle: conn.bi ? "solid" : "dashed"
        };

        return (
            <div style={style} />
        )
    }
}