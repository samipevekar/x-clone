import React, { useState } from 'react';
import Story from './Story';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';
import UserStoryModal from './UserStoryModal';
import StorySkeleton from '../skeletons/StorySkeleton';

import { BiPlus } from "react-icons/bi";
import StoryModal from './StoryPage';

export default function Stories() {

    const URL = import.meta.env.VITE_URL

    const [selectedStory, setSelectedStory] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: authUser } = useQuery({ queryKey: ['authUser'] })

    // Fetching the stories of the users the current user is following
    const { data: followingStories, isError, isLoading } = useQuery({
        queryKey: ["followingStories"],
        queryFn: async () => {
            try {
                const res = await fetch(`${URL}/api/story/followingstories`,{credentials:"include"});
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || "Something went wrong");
                }
                return data;
            } catch (error) {
                throw new Error(error.message);
            }
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    // fetching stories of currently authenticated user
    const { data: myStory, isLoading: isStoryLoading, refetch: userStoryFetch } = useQuery({
        queryKey: ["userStory"],
        queryFn: async () => {
            try {
                const res = await fetch(`${URL}/api/story/mystory/`,{credentials:"include"})
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || "Failed to fetch user story");
                }
                return data;
            } catch (error) {
                throw new Error(error.message);
            }
        },
    });


    const handleStoryClick = (story) => {
        setSelectedStory(story);
        document.getElementById('following_story').showModal();
    };

    const handleOnClose = () => {
        document.getElementById('following_story').close();
    };

    if (isLoading) return <StorySkeleton />;
    if (isError) return <div>Error loading stories</div>;

    return (
        <>
            <div className='flex gap-3 p-4 border-b border-gray-700 cursor-pointer overflow-auto max-w-[350px] sm:max-w-[650px] md:max-w-[700px] lg:max-w-full'>



                {myStory?.length > 0 && myStory ?
                    (
                        myStory.map((story) => {
                            return (
                                <div key={story._id} className='shrink-0' onClick={() => handleStoryClick(story)}>
                                    <div className='flex-col items-center justify-center '>
                                        <img className='w-[70px] h-[70px]  rounded-full m-auto border-[3px] border-primary p-[2px]' src={authUser.profileImg || '/avatar-placeholder.png'} alt="" />
                                        <p className='text-[12px]  text-center'>Your Story</p>
                                    </div>
                                </div>
                            )
                        })
                    ) :
                    (
                        <div className='shrink-0'>
                            <div className='flex-col items-center justify-center relative ' onClick={() => setIsModalOpen(true)}>
                                <img className='w-[70px] h-[70px]  rounded-full m-auto' src={authUser.profileImg || '/avatar-placeholder.png'} alt="" />
                                <p className='text-[12px]  text-center'>Your Story</p>
                                <div className='w-4 h-4 absolute right-2 top-[50px] text-center  bg-primary  flex items-center justify-center rounded-full text-[12px] '><BiPlus /></div>

                            </div>
                            <StoryModal
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                            />
                        </div>
                    )
                }


                {followingStories && followingStories.length > 0 && (
                    followingStories.map((story) => (
                        <div className='flex-shrink-0' key={story._id} onClick={() => handleStoryClick(story)}>
                            <Story profileImg={story.user.profileImg || "/avatar-placeholder.png"} username={story.user.username} />
                        </div>
                    ))
                )}
            </div>

            <UserStoryModal id="following_story" story={selectedStory} onClose={handleOnClose} storyId={selectedStory?._id}  />
        </>
    );
}
