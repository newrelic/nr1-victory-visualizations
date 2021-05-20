import colors from './colors';
import typography from './typography';

const BASE_SPACING = 8;

const baseFontFamily = '"Open Sans", "Segoe UI", "Tahoma", sans-serif';

export const baseLabelStyles = {
  fontFamily: baseFontFamily,
  fontWeight: 400,
  fontSize: 12,
  padding: BASE_SPACING,
};

const centeredLabelStyles = { textAnchor: 'middle', ...baseLabelStyles };

const strokeLinecap = 'round';
const strokeLinejoin = 'round';

const shadow1 = 'drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.32))';

export default {
  axis: {
    style: {
      axis: {
        fill: 'transparent',
        stroke: colors.base.gray4,
        strokeWidth: 1,
        strokeLinecap,
        strokeLinejoin,
      },
      axisLabel: baseLabelStyles,
      axisLabel: {
        ...centeredLabelStyles,
        padding: BASE_SPACING,
        stroke: 'transparent',
      },
      grid: {
        fill: 'none',
        stroke: colors.base.gray4,
        strokeDasharray: '10, 5',
        strokeLinecap,
        strokeLinejoin,
        pointerEvents: 'painted',
      },
      ticks: {
        fill: 'transparent',
        size: 5,
        stroke: colors.base.gray4,
        strokeWidth: 1,
        strokeLinecap,
        strokeLinejoin,
      },
      tickLabels: baseLabelStyles,
    },
  },
  tooltip: {
    style: {
      fontFamily: baseFontFamily,
      fontSize: 12,
      color: typography.heading6.color,
    },
    flyoutStyle: {
      strokeWidth: 0,
      fill: colors.background.surface,
      filter: shadow1,
    },
    flyoutPadding: {
      top: BASE_SPACING,
      bottom: BASE_SPACING,
      left: BASE_SPACING * 2,
      right: BASE_SPACING * 2,
    },
  },
};
