import PageTransition from '@/web/components/PageTransition'
import { cx } from '@emotion/css'
const About = () => {
  
  return (
    <PageTransition>
      <div className='about text-white text-center'> 
        <div className='basic-info padding-top-10'> 
        <span> 基于 https://github.com/qier222/YesPlayMusic 二次开发 </span>
        </div>
        <div className='contact-me margin-top-10'>
            联系方式: wdf.coder@gmail.com | nwyfnck@gmail.com
        </div>
      </div>
    </PageTransition>
  )
}

export default About
