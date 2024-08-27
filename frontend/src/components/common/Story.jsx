import { useQuery } from '@tanstack/react-query'
import React from 'react'

export default function Story({username, profileImg}) {



  return (
    <div>
      <div className='flex-col items-center justify-center '>
        <img className='w-[70px] h-[70px]  rounded-full m-auto border-[3px] border-primary p-[2px]' src={profileImg} alt="" />
        <p className='text-[12px]  text-center'>{username.slice(0,10)}...</p>
      </div>
    </div>
  )
}
