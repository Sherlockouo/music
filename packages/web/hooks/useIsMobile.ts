import useBreakpoint from './useBreakpoint'

const useIsMobile = () => {
  // const breakpoint = useBreakpoint()
  // return ['xs', 'sm', 'md'].includes(breakpoint)
  // return false
  return window.innerWidth <= 768
}

export default useIsMobile
