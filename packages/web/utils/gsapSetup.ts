/**
 * GSAP 全局配置 — 注册插件 + 设置默认缓动
 *
 * 在 App 入口（main.tsx）顶部 import 一次即可。
 * 其他组件直接从这里 re-export gsap/ScrollTrigger/Flip，
 * 确保插件在使用前已注册。
 */
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger)

// 全局默认缓动 — 比 CSS ease-out 更有"弹性感"
gsap.defaults({
  ease: 'power2.out',
  duration: 0.5,
})

export { gsap, ScrollTrigger }
