import * as React from "react"
import Svg, { Path, Rect } from "react-native-svg"
import { BottomTabProps } from "./ArrowDown"

const ServersIcon = (props: BottomTabProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Rect
      x={2}
      y={2}
      width={20}
      height={8}
      rx={2}
      stroke={props.color || "#F1FCF2"}
      strokeWidth={2}
    />
    <Rect
      x={2}
      y={14}
      width={20}
      height={8}
      rx={2}
      stroke={props.color || "#F1FCF2"}
      strokeWidth={2}
    />
    <Path
      fill={props.color || "#F1FCF2"}
      d="M6 6h.01M6 18h.01"
    />
  </Svg>
)

export default ServersIcon
