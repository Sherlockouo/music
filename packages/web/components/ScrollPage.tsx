import React, { ReactNode, useState, useEffect, useRef } from 'react'
import { throttle } from 'lodash'
import Loading from './Animation/Loading'

const ScrollPagination = ({
  getData,
  renderItems,
}: {
  getData: (pageNo: number, pageSize: number) => Promise<{ hasMore: boolean }>
  renderItems: () => ReactNode
}) => {
  const [current, setCurrent] = useState(0) // 当前页码
  const [isFetching, setIsFetching] = useState(false) // 是否正在获取数据
  const [hasMore, setHasMore] = useState(true)
  const containerRef = useRef(null)
  const observerRef = useRef(null)

  useEffect(() => {
    const options = {
      root: null,
      threshold: 0.5, // 根据需要调整阈值
    }
    const handleObserver = throttle(entries => {
      const isIntersecting = entries.some(entry => entry.isIntersecting)

      if (isIntersecting && !isFetching && hasMore) {
        // 最后一个元素进入视窗且未在获取数据
        setIsFetching(true) // 设置为正在获取数据的状态
        setCurrent(prev => prev + 1) // 更新当前页码
      }
    }, 1500)

    // 创建 IntersectionObserver 实例
    observerRef.current = new IntersectionObserver(handleObserver, options)

    // 获取透明容器作为观察目标
    const transparentContainer = containerRef.current.querySelector('.transparent-container')
    if (transparentContainer) {
      observerRef.current.observe(transparentContainer)
    }

    // 组件卸载时停止观察
    return () => {
      if (transparentContainer) {
        observerRef.current.unobserve(transparentContainer)
      }
    }
  }, [isFetching])

  useEffect(() => {
    if (isFetching) {
      // 获取数据
      getData(current, 100)
        .then(({ items, hasMore }) => {
          if (hasMore) {
            setIsFetching(false) // 设置为获取数据完成的状态
          } else {
            setIsFetching(false) // 设置为获取数据完成的状态
            setHasMore(false)
            observerRef.current.disconnect() // 停止观察
            // Todo: add i18n toast
            // toast('no more')
          }
        })
        .catch(error => {
          setIsFetching(false) // 设置为获取数据完成的状态
          console.error('数据获取失败:', error)
        })
    }
  }, [current, isFetching])

  return (
    <div ref={containerRef} className='infinite-scroll-component h-100 w-full '>
      {renderItems()}
      <div className='flex w-full items-center justify-center'>{isFetching && <Loading />}</div>
      <div className='transparent-container' style={{ height: '1px', marginBottom: '-1px' }}></div>
    </div>
  )
}

export default ScrollPagination
