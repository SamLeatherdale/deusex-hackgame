import React, {CSSProperties} from "react";
import LevelNode from "../classes/LevelNode";
import {condAttr, NodeSelection, TypedObj} from "../shared";
import * as autoBind from "auto-bind";

export enum NodeMenuAction {
    CAPTURE,
    NUKE,
    STOP,
    FORTIFY
}

interface NodeMenuProps {
    node: LevelNode;
    onNodeMenuAction: (e: Event, action: NodeMenuAction) => void;
}

interface NodeMenuState {
    hoveredItem: string;
}

interface MenuItem {
    title: string;
    subtitle: string;
    placement: string;
    className: string;
    enabled: boolean;
    action: NodeMenuAction;
}

export default class NodeMenu extends React.Component<NodeMenuProps, NodeMenuState> {
    constructor(props: NodeMenuProps) {
        super(props);

        this.state = {
            hoveredItem: ""
        };

        autoBind.react(this);
    }

    onMouseOver(itemKey: string) {
        this.setState({hoveredItem: itemKey});
    }

    onMouseOut(itemKey: string) {
        this.setState({hoveredItem: ""});
    }

    render() {
        const {node} = this.props;
        const menuItemData: MenuItem[] = [
            {
                title: "Capture",
                subtitle: "Detection: 100%",
                placement: "top",
                className: "fas fa-flag",
                enabled: !node.captured,
                action: NodeMenuAction.CAPTURE,
            },
            {
                title: "Nuke",
                subtitle: "Undetectable",
                placement: "left",
                className: "fas fa-radiation",
                enabled: !node.captured,
                action: NodeMenuAction.NUKE,
            },
            {
                title: "Stop!",
                subtitle: "Undetectable",
                placement: "right",
                className: "fas fa-hand-paper",
                enabled: node.captured,
                action: NodeMenuAction.STOP,
            },
            {
                title: "Fortify",
                subtitle: "Detection: 100%",
                placement: "bottom",
                className: "fas fa-shield-alt",
                enabled: node.canBeFortified(),
                action: NodeMenuAction.FORTIFY,
            }
        ];

        const menuItems = menuItemData.map(menuItem => (
            <li
                key={menuItem.title}
                data-disabled={condAttr(!menuItem.enabled)}
                className="node-menu-item"
                onMouseOver={condAttr(menuItem.enabled, () => this.onMouseOver(menuItem.title))}
                onMouseOut={condAttr(menuItem.enabled, () => this.onMouseOut(menuItem.title))}
                onClick={condAttr(menuItem.enabled,
                    (e) => this.props.onNodeMenuAction(e, menuItem.action))}>
                <i className={menuItem.className} />
            </li>
        ));

        const tooltips = menuItemData.filter(item => this.state.hoveredItem === item.title).map(menuItem => {
            let style: CSSProperties = {};

            return (
                <div key={`${menuItem.title}-tooltip`}
                     className="node-menu-tooltip"
                     style={style}
                     data-placement={menuItem.placement}>
                    <div className="node-menu-title">{menuItem.title}</div>
                    <div className="node-menu-subtitle">{menuItem.subtitle}</div>
                </div>
            );
        });

        return (
            <div className="node-menu">
                {tooltips}
                <div className="node-menu-tooltips">
                </div>
                <div className="node-menu-items">
                    <div>{menuItems[0]}</div>
                    <div>{menuItems.slice(1, 3)}</div>
                    <div>{menuItems[3]}</div>
                </div>
            </div>
        );
    }
}
