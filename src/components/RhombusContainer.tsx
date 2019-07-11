import React, {CSSProperties} from "react";
import {Color} from "csstype";
import {DXBorderColor, TypedObj} from "../shared";
import {Point} from "../classes/LevelData";

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

interface LineProps {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

interface ArcProps {
    start: Point;
}
/**
 * Renders a Deus Ex style rhombus container with triangular edges on the specified sides.
 */
export default class RhombusContainer extends React.Component<RhombusContainerProps> {
    static defaultProps = {
        corners: [RhombusCorner.BOTTOM_LEFT, RhombusCorner.TOP_RIGHT],
        width: 20,
        height: 20,
        offset: -3,
        bgColor: "black",
        fgColor: DXBorderColor,
        lineWidth: 1
    };

    static getLineProps(corner: RhombusCorner, width: number, height: number, buffer: number): LineProps {
        const xBuf = width + buffer;
        const yBuf = height + buffer;

        switch (corner) {
            case RhombusCorner.TOP_LEFT:
                return {x1: 0, y1: height, x2: width, y2: 0};
            case RhombusCorner.TOP_RIGHT:
                return {x1: xBuf, y1: 0, x2: xBuf + width, y2: height};
            case RhombusCorner.BOTTOM_RIGHT:
                return {x1: xBuf + width, y1: yBuf, x2: xBuf, y2: yBuf + height};
            case RhombusCorner.BOTTOM_LEFT:
                return {x1: width, y1: yBuf + height, x2: 0, y2: yBuf};
        }
    }

    /**
     * M 0 0    Start XY
     * A 50 50  XY Radius
     * 0 0 1    rotationDeg | isLarge | isSweep
     * 50 50    End XY
     *
     */
    static getArcProps() {
    }

    render() {
        const {corners, children, offset, width, height, bgColor, fgColor, lineWidth} = this.props;
        const els = [];
        const allCorners = [RhombusCorner.TOP_LEFT, RhombusCorner.TOP_RIGHT, RhombusCorner.BOTTOM_LEFT, RhombusCorner.BOTTOM_RIGHT];

        const buffer = 20;
        const svgChildren = allCorners.map(corner => {
            const isCorner = corners.indexOf(corner) >= 0;


            if (isCorner) {
                const p = RhombusContainer.getLineProps(corner, width, height, buffer);
                return `<line x1=${p.x1} y1=${p.y1} x2=${p.x2} y2=${p.y2} />`;
            } else {
                return
            }
        });
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
