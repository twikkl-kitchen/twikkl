import * as React from "react"
import Svg, { Path, Circle } from "react-native-svg"
import { BottomTabProps } from "./ArrowDown"

const SunIcon = (props: BottomTabProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Circle
      cx={12}
      cy={12}
      r={4}
      stroke={props.color || "#F1FCF2"}
      strokeWidth={2}
    />
    <Path
      stroke={props.color || "#F1FCF2"}
      strokeWidth={2}
      strokeLinecap="round"
      d="M12 2v2M12 20v2M20 12h2M2 12h2M17.657 6.343l1.414-1.414M4.929 19.071l1.414-1.414M17.657 17.657l1.414 1.414M4.929 4.929l1.414 1.414"
    />
  </Svg>
)

export default SunIcon
