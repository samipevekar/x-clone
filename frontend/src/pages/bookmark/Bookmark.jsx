import { useQuery } from '@tanstack/react-query'
import React, { lazy, Suspense, useEffect } from 'react'
import PostSkeleton from '../../components/skeletons/PostSkeleton';

const Post = lazy(() => import('../../components/common/Post'))

export default function Bookmark() {

    const URL = import.meta.env.VITE_URL

    // Fetch bookmark posts using react-query
    const { data: bookmarkPosts, isLoading, isPending, refetch, isRefetching } = useQuery({
        queryKey: ['bookmarkPosts'],
        queryFn: async () => {
            try {
                const res = await fetch(`${URL}/api/posts/bookmarks`, {
                    headers: {
                        "auth-token": localStorage.getItem("auth-token")
                    },
                    credentials: "include"
                });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Something went wrong");
                }

                return data;

            } catch (error) {
                throw new Error(error);
            }
        }
    });

    useEffect(() => {
        refetch();
    }, [bookmarkPosts, refetch]);

    // Safely map through bookmarkPosts if it's defined and has data
    return (
        <div className='border-r-[1px] border-gray-700 w-full'>
            <div className='w-full h-[30px] flex items-center px-4 py-8 text-[30px] border-b border-gray-700'>
                <p className='font-bold text-[16px] h-[20px]'>Bookmarks</p>
            </div>

            <div>
                {(isLoading || isPending || isRefetching) &&
                    Array(3).fill(<PostSkeleton />).map(elt => {
                        return elt
                    })
                }

                {bookmarkPosts && bookmarkPosts.length > 0 && !isRefetching ?
                    bookmarkPosts.map((post) => (
                        <Suspense fallback={<></>}><Post key={post._id} post={post} /></Suspense>
                    ))
                    :
                    !isRefetching && (
                        <div className='font-bold text-center my-2'>No bookmark post 😊</div>
                    )
                }
            </div>
        </div>
    );
}
