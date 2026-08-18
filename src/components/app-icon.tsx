import { type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

export type AppIconName = 'back' | 'plus' | 'edit' | 'eye' | 'save';

export type AppIconProps = {
  name: AppIconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function AppIcon({ name, size = 18, color = 'currentColor', style }: AppIconProps) {
  switch (name) {
    case 'back':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path
            d="M19 12H5M12 19l-7-7 7-7"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'plus':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path
            d="M12 5v14M5 12h14"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'edit':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path
            d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'eye':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path
            d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle
            cx="12"
            cy="12"
            r="3"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'save':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path
            d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M17 21v-8H7v8M7 3v5h8"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
  }
}
