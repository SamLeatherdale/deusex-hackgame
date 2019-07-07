import React from "react";
import LevelNode from "../classes/LevelNode";
import {condAttr, TypedObj} from "../types/shared";

interface NodeMenuProps {
    node: LevelNode;
    updateNode: (node: LevelNode, values: TypedObj<any>) => void
}

interface MenuItem {
    title: string;
    subtitle: string;
    className: string;
    enabled: boolean;
    onClick: () => void;
}

export default class NodeMenu extends React.Component<NodeMenuProps> {
    constructor(props: NodeMenuProps) {
        super(props);

        this.captureNode = this.captureNode.bind(this);
        this.nukeNode = this.nukeNode.bind(this);
        this.stopNode = this.stopNode.bind(this);
        this.fortifyNode = this.fortifyNode.bind(this);
    }

    captureNode() {
        if (this.props.node.canBeCaptured()) {
            this.props.node.captured = true;
            this.props.node.menuOpen = false;
            this.props.updateNode(this.props.node, {});
        }
    }

    nukeNode() {

    }

    stopNode() {

    }

    fortifyNode() {

    }

    render() {
        const {node} = this.props;
        const menuItemData: MenuItem[] = [
            {
                title: "Capture",
                subtitle: "Detection: 100%",
                className: "fas fa-flag",
                enabled: !node.captured,
                onClick: this.captureNode,
            },
            {
                title: "Nuke",
                subtitle: "Undetectable",
                className: "fas fa-radiation",
                enabled: !node.captured,
                onClick: this.nukeNode,
            },
            {
                title: "Stop!",
                subtitle: "Undetectable",
                className: "fas fa-hand-paper",
                enabled: node.captured,
                onClick: this.stopNode,
            },
            {
                title: "Fortify",
                subtitle: "Detection: 100%",
                className: "fas fa-shield-alt",
                enabled: node.captured,
                onClick: this.fortifyNode
            }
        ];

        const menuItems = menuItemData.map(menuItem => (
            <li key={menuItem.title}
                data-disabled={condAttr(!menuItem.enabled)}
                className="node-menu-item"
                onClick={condAttr(menuItem.enabled, menuItem.onClick)}>
                <i className={menuItem.className} />
            </li>
        ));


        return (
            <div className="node-menu">
                <div>{menuItems[0]}</div>
                <div>{menuItems.slice(1, 3)}</div>
                <div>{menuItems[3]}</div>
            </div>
        );
    }
}
