import * as React from "react"
import Svg, { Path, Circle } from "react-native-svg"
import { BottomTabProps } from "./ArrowDown"

const SearchIcon = (props: BottomTabProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Circle
      cx={10}
      cy={10}
      r={7}
      stroke={props.color || "#F1FCF2"}
      strokeWidth={2}
    />
    <Path
      stroke={props.color || "#F1FCF2"}
      strokeWidth={2}
      strokeLinecap="round"
      d="M15 15l6 6"
    />
  </Svg>
)

export default SearchIcon
