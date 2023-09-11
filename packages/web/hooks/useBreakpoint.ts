import { createBreakpoint } from 'react-use'

const useBreakpoint = createBreakpoint({
  xs: 240,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}) as () => 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export default useBreakpoint
