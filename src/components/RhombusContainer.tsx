import React, {CSSProperties, HTMLAttributes} from "react";
import {Color} from "csstype";
import {DXBorderColor, TypedObj} from "../shared";

interface RhombusContainerProps {
    id?: string;
    className?: string;
    corners: RhombusCorner[];
    offset: number;
    width: number;
    height: number;
    bgColor: Color;
    fgColor: Color;
    lineWidth: number;
    props?: TypedObj<any>
}

export enum RhombusCorner {
    TOP_LEFT = "tri-tl",
    TOP_RIGHT = "tri-tr",
    BOTTOM_LEFT = "tri-bl",
    BOTTOM_RIGHT = "tri-br"
}

/**
 * Renders a Deus Ex style rhombus container with triangular edges on the specified sides.
 */
export default class RhombusContainer extends React.Component<RhombusContainerProps> {
    static defaultProps = {
        width: 20,
        height: 20,
        offset: -3,
        bgColor: "black",
        fgColor: DXBorderColor,
        lineWidth: 1
    };

    render() {
        const {corners, children, offset, width, height, bgColor, fgColor, lineWidth} = this.props;
        const els = [];
        corners.forEach(corner => {
            for (let i = 0; i < 2; i++) {
                const isBg = i === 0;
                const styles: CSSProperties = {
                    width: `${isBg ? width - lineWidth : width}px`,
                    height: `${isBg ? height - lineWidth : height}px`,
                    zIndex: isBg ? 1 : 0
                };

                let myOffset;
                if (isBg) {
                    styles.backgroundColor = bgColor;
                    myOffset = offset;
                } else {
                    styles.backgroundColor = fgColor;
                    myOffset = offset + 1;
                }

                switch (corner) {
                    case RhombusCorner.TOP_LEFT:
                        styles.top = myOffset;
                        styles.left = myOffset;
                        break;
                    case RhombusCorner.TOP_RIGHT:
                        styles.top = myOffset;
                        styles.right = myOffset;
                        break;
                    case RhombusCorner.BOTTOM_LEFT:
                        styles.bottom = myOffset;
                        styles.left = myOffset;
                        break;
                    case RhombusCorner.BOTTOM_RIGHT:
                        styles.bottom = myOffset;
                        styles.right = myOffset;
                        break;

                }


                els.push(
                    <div
                        key={`${corner}-${isBg ? "bg" : "fg"}`}
                        className={["rhombus-corner", corner].join(' ')}
                        style={styles}/>
                );
            }
        });

        const remainingProps = this.props.props ? this.props.props : {};

        return (
            <div id={this.props.id}
                 className={["rhombus-container", this.props.className].join(' ')}
                 {...remainingProps}>
                <div className="rhombus-corners">
                    {els}
                </div>
                {children}
            </div>
        )
    }
}
