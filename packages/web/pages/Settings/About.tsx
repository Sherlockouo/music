import PageTransition from '@/web/components/PageTransition'
import { cx } from '@emotion/css'
const About = () => {
  
  return (
    <PageTransition>
      <div className='about text-white text-center'> 
        <div className='basic-info padding-top-10'> 
            基于 <span >https://github.com/qier222/YesPlayMusic</span> 二次开发
        </div>
        
        <div className='contact-me margin-top-10'>
            联系方式: wdf.coder@gmail.com | nwyfnck@gmail.com
        </div>
      </div>
    </PageTransition>
  )
}

export default About
