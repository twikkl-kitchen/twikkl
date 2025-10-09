import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { BottomTabProps } from "./ArrowDown"

const MoonIcon = (props: BottomTabProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#F1FCF2"}
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
    />
  </Svg>
)

export default MoonIcon
