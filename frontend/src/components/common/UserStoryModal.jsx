import React from 'react';
import { Link } from 'react-router-dom';
import { formatPostDate } from '../../utils/date';

import { RiDeleteBin6Fill } from "react-icons/ri";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const UserStoryModal = ({ id, story, onClose, storyId}) => {

  const queryClient = useQueryClient()

  const {data:authUser} = useQuery({queryKey:["authUser"]})



  const {mutate:deleteStory,isPending} = useMutation({
    mutationFn:async(id)=>{
      const res = await fetch(`/api/story/stories/${id}`,{
        method: 'DELETE',
      })

      const data = await res.json()
      if(!res.ok){
        throw new Error(data.message || "Something went wrong")
      }

      return data
    },
    onSuccess:()=>{
      toast.success("Story deleted successfully")
      queryClient.invalidateQueries({queryKey:["userStory"]})
      onClose(id)

    }

  })

  const handleStoryDelete = ()=>{
    if(isPending) return 
    deleteStory(storyId)
  }


  return (
    <dialog id={id} className="modal">
      <div className="modal-box h-full border bg-slate-500 rounded w-[400px] relative">
        <form method="dialog" className='absolute right-3 top-2.5'>
          {/* Close button */}
          <button
            type="button"
            className="border-none outline-none text-white absolute right-3 font-bold top-2"
            onClick={onClose}
          >
            ✕
          </button>
        </form>

        {story?.user?._id === authUser?._id && <div className='dropdown absolute right-20 top-5.5 '>
          <div tabIndex={0} role="button" className='absolute right-5 top-5.5  rounded cursor-pointer'><BsThreeDotsVertical className='text-white' /></div>
          <ul tabIndex={0} className="absolute right-20 top-5.5  dropdown-content menu bg-white w-fit  z-[1] rounded p-2 shadow">
            <div className='flex gap-1 items-center w-fit cursor-pointer text-black font-semibold'  onClick={handleStoryDelete}><RiDeleteBin6Fill className='text-red-500' />{isPending ? "Deleting..." : "Delete"}</div>
          </ul>
        </div>}



        <Link to={`/profile/${story?.user.username}`}>
          <div className='flex items-center gap-2 absolute top-4'>
            <img className='w-8 h-8 rounded-full' src={story?.user.profileImg || '/avatar-placeholder.png'} alt="" />
            <p className='text-white font-semibold'>{story?.user.username}</p>
            <p>{formatPostDate(story?.createdAt)}</p>
          </div>
        </Link>
        {<div className='mt-[50px] '>
          {story?.img ? (
            <img className='w-full h-[450px] object-contain ' src={story?.img} alt="User Story" />
          ) : (
            <p className='text-[18px] break-words'>{story?.text}</p>
          )}
        </div>}
      </div>
    </dialog>
  );
};

export default UserStoryModal;
