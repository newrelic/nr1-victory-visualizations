import colors from './colors';

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
};
