import React from 'react';
import Svg, { Polygon, Line, G } from 'react-native-svg';
import { colors } from '../theme/colors';

interface Props {
  size?: number;
  showFacets?: boolean;
}

export function Logo({ size = 64, showFacets = true }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon
        points="35,22 65,18 82,38 78,68 55,82 25,72 18,50 22,32"
        fill="none"
        stroke={colors.text}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <Polygon
        points="65,18 82,38 78,68 55,82"
        fill={colors.accent}
        fillOpacity={0.55}
      />
      {showFacets && (
        <G stroke={colors.text} strokeWidth={1} strokeOpacity={0.3}>
          <Line x1={48} y1={48} x2={65} y2={18} />
          <Line x1={48} y1={48} x2={82} y2={38} />
          <Line x1={48} y1={48} x2={78} y2={68} />
          <Line x1={48} y1={48} x2={55} y2={82} />
          <Line x1={48} y1={48} x2={35} y2={22} />
          <Line x1={48} y1={48} x2={25} y2={72} />
          <Line x1={48} y1={48} x2={18} y2={50} />
          <Line x1={48} y1={48} x2={22} y2={32} />
        </G>
      )}
    </Svg>
  );
}
