import Icon from '../Icon'

const Loading = () => {
  return (
    <>
      <div className='flex h-5 w-5 items-center justify-center text-center'>
        <Icon name='loading' className='animate-spin' />
      </div>
    </>
  )
}

export default Loading
