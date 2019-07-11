import {CSSProperties} from "react";
import {Color} from "csstype";
import {DXBorderColor, TypedObj} from "../shared";
import {Point} from "./LevelData";
import encodeSVG from "svg-to-dataurl";

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

interface SVGProps {
    corners: RhombusCorner[];
    width: number;
    height: number;
    fgColor: Color;
    lineWidth: number;
    buffer: number;
    radiusDegrees: number;
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

class Arc {
    start: Point;
    end: Point;
    arc: Point;
    rotation: number;
    isLarge: boolean;
    isSweep: boolean;

    constructor(start: Point, end: Point, arc: Point, rotation = 0, isLarge = false, isSweep = false) {
        this.start = start;
        this.end = end;
        this.arc = arc;
        this.rotation = rotation;
        this.isLarge = isLarge;
        this.isSweep = isSweep;
    }
}
/**
 * Renders a Deus Ex style rhombus container with triangular edges on the specified sides.
 */
export default class RhombusContainer {
    static cached: Map<string, string> = new Map();
    static cachedIdx: number = 1;

    static getCSSVariable(svg: string): string {
        if (CSS && CSS.supports('color', 'var(--test)')) {
            let css = RhombusContainer.cached.get(svg);
            if (!css) {
                css = `--custom-svg-border-${RhombusContainer.cachedIdx++}`;
                document.documentElement.style.setProperty(css, svg);
                RhombusContainer.cached.set(svg, css);
            }
            return css;
        }
    }

    static svgDefaultProps = {
        corners: [RhombusCorner.BOTTOM_LEFT, RhombusCorner.TOP_RIGHT],
        width: 20,
        height: 20,
        fgColor: DXBorderColor,
        lineWidth: 3,
        buffer: 20,
        radiusDegrees: 20
    };

    static getLineProps(corner: RhombusCorner, props: SVGProps): LineProps {
        const {width, height, buffer} = props;
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

    static getBufferProps(corner: RhombusCorner, props: SVGProps): LineProps {
        const {width, height, buffer} = props;
        const xBuf = width + buffer;
        const yBuf = height + buffer;

        switch (corner) {
            case RhombusCorner.TOP_LEFT:
                return {x1: width, y1: 0, x2: xBuf, y2: 0};
            case RhombusCorner.TOP_RIGHT:
                return {x1: xBuf + width, y1: height, x2: xBuf + width, y2: yBuf};
            case RhombusCorner.BOTTOM_RIGHT:
                return {x1: xBuf, y1: yBuf + height, x2: width, y2: yBuf + height};
            case RhombusCorner.BOTTOM_LEFT:
                return {x1: 0, y1: yBuf, x2: 0, y2: height};
        }
    }

    static getLine(p: LineProps, props: SVGProps) {
        return `<line x1="${p.x1}" y1="${p.y1}" x2="${p.x2}" y2="${p.y2}" 
            stroke="${props.fgColor}" stroke-width="${props.lineWidth}" />`;
    }

    static getBorderImage(partialProps: Partial<SVGProps> = {}): CSSProperties {
        const props: SVGProps = Object.assign({}, RhombusContainer.svgDefaultProps, partialProps);
        const {corners, width, height, fgColor, lineWidth, buffer, radiusDegrees} = props;
        const allCorners = [RhombusCorner.TOP_LEFT, RhombusCorner.TOP_RIGHT, RhombusCorner.BOTTOM_LEFT, RhombusCorner.BOTTOM_RIGHT];

        const svgChildren = allCorners.map(corner => {
            const isCorner = corners.indexOf(corner) >= 0;
            const p = RhombusContainer.getLineProps(corner, props);
            const lines = [];

            if (isCorner) {
                lines.push(RhombusContainer.getLine(p, props));
            } else {
                /**
                 * M 0 0    Start XY
                 * A 50 50  XY Radius
                 * 0 0 1    rotationDeg | isLarge | isSweep
                 * 50 50    End XY
                 */
                lines.push(`<path d="M ${p.x1} ${p.y1} A ${radiusDegrees} ${radiusDegrees} 0 0 1 ${p.x2} ${p.y2}" 
                    stroke="${fgColor}" fill="none" stroke-width="${lineWidth}" />`)
            }
            lines.push(RhombusContainer.getLine(
                RhombusContainer.getBufferProps(corner, props), props));
            return lines.join("\n");
        });

        //Add in buffers

        const svgWidth = 2 * width + buffer;
        const svgHeight = 2 * height + buffer;
        const svg =
        `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" 
            width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
            ${svgChildren.join('\n')}
        </svg>`;
        const svgProperty = `url("${encodeSVG(svg)}")`;

        const borderStyle: CSSProperties = {
            borderImageSource: svgProperty,
            borderImageSlice: `${height} ${width}`,
            borderImageWidth: `${height}px ${width}px`,
            borderImageOutset: "0px",
            borderImageRepeat: "stretch"
        };

        const cssVar = RhombusContainer.getCSSVariable(svgProperty);
        if (cssVar) {
            borderStyle.borderImageSource = `var(${cssVar})`;
        }

        return borderStyle;
    }
}
