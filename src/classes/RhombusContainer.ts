import  {CSSProperties} from "react";
import {Color} from "csstype";
import {DXBGLight, DXBorderColor} from "../shared";
import encodeSVG from "svg-to-dataurl";

interface SVGProps {
    corners: RhombusCorner[];
    width: number;
    height: number;
    fgColor: Color;
    bgColor: Color;
    lineWidth: number;
    buffer: number;
    radiusDegrees: number;
    mask: boolean;
    variableName?: string;
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

/**
 * Renders a Deus Ex style rhombus container with triangular edges on the specified sides.
 */
export default class RhombusContainer {
    private static addedDefaults = false;
    private static cached: Map<string, string> = new Map();
    private static cachedIdx: number = 1;

    private static svgDefaultProps: SVGProps = {
        corners: [RhombusCorner.BOTTOM_LEFT, RhombusCorner.TOP_RIGHT],
        width: 20,
        height: 20,
        fgColor: DXBorderColor,
        bgColor: "none",
        lineWidth: 3,
        buffer: 20,
        radiusDegrees: 20,
        mask: false
    };

    private static getCSSVariable(svg: string, name?: string): string {
        if (CSS && CSS.supports('color', 'var(--test)')) {
            let css = RhombusContainer.cached.get(svg);
            if (!css) {
                css = `--dx-svg-border-${name ? name : RhombusContainer.cachedIdx++}`;
                document.documentElement.style.setProperty(css, svg);
                RhombusContainer.cached.set(svg, css);
            }
            return css;
        }
    }

    private static addDefaults() {
        RhombusContainer.addedDefaults = true;
        RhombusContainer.getBorderImage({variableName: "button"});
        RhombusContainer.getBorderImage({bgColor: DXBGLight, variableName: "button-hover"});
    }

    private static getLineProps(corner: RhombusCorner, props: SVGProps): LineProps {
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

    private static getBufferProps(corner: RhombusCorner, props: SVGProps): LineProps {
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

    private static getLine(p: LineProps, props: SVGProps) {
        return `<line x1="${p.x1}" y1="${p.y1}" x2="${p.x2}" y2="${p.y2}" 
            stroke="${props.fgColor}" stroke-width="${props.lineWidth}" />`;
    }

    public static getBorderImage(partialProps: Partial<SVGProps> = {}): CSSProperties {
        if (!RhombusContainer.addedDefaults) {
            RhombusContainer.addDefaults();
        }

        const props: SVGProps = Object.assign({}, RhombusContainer.svgDefaultProps, partialProps);
        const {corners, width, height, lineWidth, buffer, radiusDegrees} = props;
        let {fgColor, bgColor} = props;
        const allCorners = [RhombusCorner.TOP_LEFT, RhombusCorner.TOP_RIGHT, RhombusCorner.BOTTOM_RIGHT, RhombusCorner.BOTTOM_LEFT];

        const path: string[] = [];
        allCorners.forEach((corner, i) => {
            const isCorner = corners.indexOf(corner) >= 0;
            const p = RhombusContainer.getLineProps(corner, props);

            if (i === 0) {
                path.push(`M ${p.x1} ${p.y1}`);
            }

            if (isCorner) {
                path.push(`L ${p.x2} ${p.y2}`);
            } else {
                /**
                 * M 0 0    Start XY
                 * A 50 50  XY Radius
                 * 0 0 1    rotationDeg | isLarge | isSweep
                 * 50 50    End XY
                 */
                path.push(`A ${radiusDegrees} ${radiusDegrees} 0 0 1 ${p.x2} ${p.y2}`);
            }
            const buf = RhombusContainer.getBufferProps(corner, props);
            path.push(`L ${buf.x2} ${buf.y2}`);
        });

        let strokeOpacity = 1;
        if (fgColor === "transparent") {
            fgColor = "#000";
            strokeOpacity = 0;
        }

        //Add in buffers
        const svgWidth = 2 * width + buffer;
        const svgHeight = 2 * height + buffer;
        const svg =
        `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" 
            width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
            <path d="${path.join('\n')}" stroke="${fgColor}" stroke-opacity="${strokeOpacity}" stroke-width="${lineWidth}" fill="${bgColor}" />
        </svg>`;
        const svgProperty = `url("${encodeSVG(svg)}")`;

        const borderStyle: CSSProperties = {
            borderImageSource: svgProperty,
            borderImageSlice: `${height} ${width} ${bgColor !== "none" ? "fill" : ""}`,
            borderImageWidth: `${height}px ${width}px`,
            borderImageOutset: "0px",
            borderImageRepeat: "stretch"
        };

        //Not currently supported, maybe in the future
        if (props.mask) {
            borderStyle.maskBorderSource = borderStyle.borderImageSource;
            borderStyle.maskBorderSlice = borderStyle.borderImageSlice;
            borderStyle.maskBorderWidth = borderStyle.borderImageWidth;
            borderStyle.maskBorderOutset = borderStyle.borderImageOutset;
            borderStyle.maskBorderRepeat = borderStyle.borderImageRepeat;
        }

        const cssVar = RhombusContainer.getCSSVariable(svgProperty, props.variableName);
        if (cssVar) {
            borderStyle.borderImageSource = `var(${cssVar})`;
        }

        return borderStyle;
    }
}
