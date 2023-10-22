import React, { useState } from 'react'
import Icon from '../Icon'
import { useTranslation } from 'react-i18next'
import { uploadSong } from '@/web/api/user'
import toast from 'react-hot-toast'

function FileUploader() {
  const [selectedFile, setSelectedFile] = useState(null)
  const { t } = useTranslation()
  const handleFileChange = (event: any) => {
    console.log('selectedFile ', event.target.files[0])
    setSelectedFile(event.target.files[0])

    uploadSong(event.target.files[0]).then(res => {
      console.log('upload res', res)
    })
  }
  const handleUpload = () => {
    // console.log('upload', selectedFile);
    // let formData = new FormData()
    // formData.append('songFile', selectedFile)
    // uploadSong(formData).then((res)=>{
    //     console.log('upload',res);
    // })
  }

  return (
    <div className='hover:text-accent-color-500 flex flex-row items-center font-medium'>
      <input
        type='file'
        onChange={handleFileChange}
        id={'file-input-label'}
        style={{ display: 'none' }}
        accept='audio/*'
      />
      <label htmlFor={'file-input-label'}>
        <Icon name='upload' className='mr-2 h-10 w-10' />
      </label>
      <div onClick={handleUpload}>{t`common.upload`}</div>
    </div>
  )
}

export default FileUploader
