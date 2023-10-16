import Icon from "../Icon"
import { cx } from "@emotion/css"

const Pin = ({className}:{className?:string})=>{
    return (
        <div className={cx("app-region-no-drag flex h-12 w-12 items-center justify-center",
        className
        )}>
            <Icon name='pin' className="h-5 w-5" />
        </div>
    )
}

export default Pin