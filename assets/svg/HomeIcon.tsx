import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { BottomTabProps } from "./ArrowDown"

const HomeIcon = (props: BottomTabProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color || "#F1FCF2"}
      d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"
    />
    <Path
      fill={props.color || "#F1FCF2"}
      d="M9 22V12h6v10"
    />
  </Svg>
)

export default HomeIcon
