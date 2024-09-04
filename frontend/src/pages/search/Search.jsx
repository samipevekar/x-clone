import React, { useEffect, useState } from 'react';
import { FiSearch } from "react-icons/fi";
import SearchUser from './SearchUser';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

export default function Search() {
    const URL = import.meta.env.VITE_URL;

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300); // 300ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [search]);

    const { data: searches, refetch, isFetching, isSuccess } = useQuery({
        queryKey: ['search', debouncedSearch],
        queryFn: async () => {
            if (!debouncedSearch) return []; // Return empty if search is empty
            try {
                const res = await fetch(`${URL}/api/users/search?user=${debouncedSearch}`, { credentials: "include" });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong");
                }
                return data;
            } catch (error) {
                throw new Error(error.message);
            }
        },
        enabled: !!debouncedSearch, // Only run the query if debouncedSearch is not empty
        staleTime: 5000, // Optional: avoid too frequent refetches
    });

    const handleSearch = (e) => {
        e.preventDefault();
        refetch(); // Manually trigger refetch if needed
    };

    return (
        <div className='flex-[4_4_0] border-r border-gray-700 min-h-screen p-4'>
            <div className='flex flex-col justify-center items-center'>
                <form className='flex items-center gap-2' onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search"
                        className="input rounded-full input-bordered w-[600px] max-w-[600px] max-sm:max-w-[280px]"
                        onChange={(e) => setSearch(e.target.value)}
                        value={search}
                    />
                    <button
                        type='submit'
                        className='p-3 bg-gray-100 rounded-full flex items-center justify-center'>
                        <FiSearch className='w-6 h-6 text-black' />
                    </button>
                </form>
            </div>

            <div className='flex flex-col justify-start items-start my-2 overflow-auto h-[500px]'>

                <div className='flex ml-auto mt-4 mr-auto justify-center items-center'>
                    {isFetching && <LoadingSpinner size='sm' />}
                    {isSuccess && debouncedSearch && searches.length === 0 && (
                        <p>No results found</p>
                    )}
                </div>

                {searches && searches.length > 0 && (
                    searches.map((user) => (
                        <SearchUser
                            key={user?._id} 
                            profileImg={user?.profileImg}
                            username={user?.username}
                            fullName={user?.fullName}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
