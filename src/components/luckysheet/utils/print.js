export const DPI_A4_WH_PX_MAP = {
  72: { width: 598, height: 842 },
  // 100%
  96: { width: 794, height: 1123 },
  // 125%
  120: { width: 992, height: 1403 },
  // 150%
  144: { width: 1191, height: 1684 },
  // 未知
  150: { width: 1240, height: 1754 },
  // 175%
  168: { width: 1389, height: 1964 },
  // 200%
  192: { width: 1632, height: 2112 },
  // 225%
  216: { width: 1836, height: 2376 },
  // 未知
  300: { width: 2480, height: 3508 }
}

export const getDPI = () => {
  function findFirstPositive(b, a, i, c) {
    c = (d, e) =>
      e >= d
        ? ((a = d + (e - d) / 2),
          0 < b(a) && (a == d || 0 >= b(a - 1)) ? a : 0 >= b(a) ? c(a + 1, e) : c(d, a - 1))
        : -1
    for (i = 1; 0 >= b(i); ) i *= 2
    return c(i / 2, i) | 0
  }

  const dpi = findFirstPositive((x) => matchMedia(`(max-resolution: ${x}dpi)`).matches)

  return dpi
}

/**
 * 根据当前系统DPI象素计算A4纸大小
 * @returns {object} width:a4宽度,height:a4高度
 */
export function calculateA4PaperSize() {
  const dpi = getDPI()

  switch (dpi) {
    case 72:
      return DPI_A4_WH_PX_MAP[72]
    // 100%
    case 96:
      return DPI_A4_WH_PX_MAP[96]
    // 125%
    case 120:
      return DPI_A4_WH_PX_MAP[120]
    // 150%
    case 144:
      return DPI_A4_WH_PX_MAP[144]
    case 150:
      return DPI_A4_WH_PX_MAP[150]
    // 175%
    case 168:
      return DPI_A4_WH_PX_MAP[168]
    // 200%
    case 192:
      return DPI_A4_WH_PX_MAP[192]
    // 225%
    case 216:
      return DPI_A4_WH_PX_MAP[216]
    case 300:
      return DPI_A4_WH_PX_MAP[300]
    default:
      return DPI_A4_WH_PX_MAP[96]
  }
}

export const getDevicePixelRatioAlikeLuckysheet = () => {
  return Math.ceil(window?.devicePixelRatio)
}
