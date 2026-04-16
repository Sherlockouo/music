import { prominent } from 'color.js'
import { colord } from 'colord'
import { useState, useEffect, useRef } from 'react'
import { resizeImage } from '@/web/utils/common'

/**
 * 从封面图片提取 top3 主色调，用于呼吸灯流动效果。
 * 颜色会做饱和度/亮度调整，确保在深色/浅色背景下都好看。
 */
export default function useCoverColors(url: string): string[] {
  const [colors, setColors] = useState<string[]>(['#4a3f8a', '#2d6a7a', '#7a3f5a'])
  const prevUrlRef = useRef('')

  useEffect(() => {
    if (!url || url === prevUrlRef.current) return
    prevUrlRef.current = url

    const cover = resizeImage(url, 'xs')

    prominent(cover, { amount: 3, format: 'hex', sample: 10 })
      .then((result: any) => {
        const raw = Array.isArray(result) ? result : [result]
        const adjusted = raw.map(hex => {
          let c = colord(hex)
          const hsl = c.toHsl()
          // 提升饱和度，限制亮度在合理范围
          if (hsl.s < 40) c = colord({ ...hsl, s: 40 })
          if (hsl.l > 55) c = colord({ ...c.toHsl(), l: 55 })
          if (hsl.l < 25) c = colord({ ...c.toHsl(), l: 25 })
          return c.toHex()
        })
        if (adjusted.length > 0) setColors(adjusted)
      })
      .catch(() => {
        // 提取失败保持上一次的颜色
      })
  }, [url])

  return colors
}
