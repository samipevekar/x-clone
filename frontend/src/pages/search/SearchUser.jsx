import React from 'react'
import { Link } from 'react-router-dom'

export default function SearchUser({profileImg,fullName,username}) {
  return (
    
    <Link to={`/profile/${username}`} className='flex gap-2 p-2 h-fit my-2 hover:bg-gray-800 w-full cursor-pointer'>
      <div>
        <img src={profileImg || '/avatar-placeholder.png'} className='w-12 h-12 rounded-full' />
      </div>
      <div>
        <p className='text-[16px] font-bold'>{fullName}</p>
        <p className='text-[14px] text-gray-500'>@{username}</p>
      </div>      
    </Link>
    
  )
}
