import React, { useState, useEffect, useRef, ReactNode, cloneElement } from 'react';
import Icon from './Icon';
import { cx, css } from '@emotion/css'
import toast from 'react-hot-toast'
import PageTransition from './PageTransition';

type PaginationProps = {
    children: ReactNode;
};

type ChildProps = {
    order: string;
    limit: number;
    offset: number;
};

const Pagination: React.FC<PaginationProps> = ({ children }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [offset, setOffset] = useState(0);
    const [reachLimit, setReachLimit] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null);

    const handlePrevScroll = () => {
        if (currentPage > 0) {
            // 到达滚动容器底部时触发加载下一页的数据
            setOffset((currentPage - 1) * 50)
            setCurrentPage(prevPage => prevPage - 1);
        }
    };
    const handleNextScroll = () => {
        if (reachLimit) {
            toast('no more')
            return
        }
        // 到达滚动容器底部时触发加载下一页的数据
        setOffset(currentPage * 50)
        setCurrentPage(prevPage => prevPage + 1);
    };

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { height } = entry.contentRect;
                if (height <= 98) {
                    setReachLimit(true)
                } else {
                    setReachLimit(false)
                }
                console.log('height', height);

            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
    }, []);

    return (
        <PageTransition>
            <div ref={containerRef} style={{ height: '100%', overflow: 'auto' }}>
                {React.Children.map(children, child => {
                    return cloneElement(child as React.ReactElement<ChildProps>, { order: "time", limit: 50, offset: currentPage * 50 }); // 设置 limit 和 offset 参数
                })}

                <div className={cx(css`
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            text-align: center;
    `)}>
                    {
                        reachLimit && <div className={cx('text-center')}> no more QAQ </div>
                    }
                    <div className={cx(css`
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            text-align: center;
            margin-top: 10px;
    `)}>
                        <div className={cx(css`
                    display: flex;
                    justify-content: space-around;
            text-align: center;
            width: 200px;
    `)}>
                            <button
                                onClick={handlePrevScroll}
                            >
                                <Icon name='previous' className='h-6 w-6 text-white/80' />
                            </button>
                            {currentPage}
                            <button
                                onClick={handleNextScroll}
                            >
                                <Icon name='next' className='h-6 w-6 text-white/80' />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Pagination;