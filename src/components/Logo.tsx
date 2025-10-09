import React from "react";
import Svg, { Path } from "react-native-svg";

interface LogoProps {
  width?: number;
  height?: number;
}

export default function Logo({ width = 200, height = 200 }: LogoProps) {
  return (
    <Svg 
      width={width} 
      height={height} 
      viewBox="0 0 200 200" 
      fill="none"
    >
      {/* Bottom play button - light color with curves */}
      <Path
        d="M 60 140 Q 55 120 60 100 Q 65 80 60 60 Q 75 70 90 80 Q 105 90 120 100 Q 105 110 90 120 Q 75 130 60 140 Z"
        stroke="#F1FCF2"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Top play button - green color with curves */}
      <Path
        d="M 80 140 Q 75 120 80 100 Q 85 80 80 60 Q 95 70 110 80 Q 125 90 140 100 Q 125 110 110 120 Q 95 130 80 140 Z"
        stroke="#50A040"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
