import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import usefollow from "../../hooks/useFollow";
import { useState, useEffect } from "react";
import LoadingSpinner from './LoadingSpinner';

const RightPanel = () => {
	const URL = import.meta.env.VITE_URL;
	const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

	// Track screen resize and update state accordingly
	useEffect(() => {
		const handleResize = () => {
			setIsLargeScreen(window.innerWidth >= 1024);
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const { data: suggestedUsers, isLoading } = useQuery({
		queryKey: ["suggestedUsers"],
		queryFn: async () => {
			try {
				const res = await fetch(`${URL}/api/users/suggested`, {
					headers: {
						"auth-token": localStorage.getItem("auth-token")
					},
					credentials: "include"
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		enabled: isLargeScreen, // Only fetch data if the screen is large
	});

	const { follow, isPending } = usefollow();

	// Do not render anything if the screen is small
	if (!isLargeScreen || !suggestedUsers || suggestedUsers.length === 0) return <div className="md:w-64 w-0"></div>;

	return (
		<div className='hidden lg:block my-4 mx-2'>
			<div className='bg-[#16181C] p-4 rounded-md sticky top-2'>
				<p className='font-bold'>Who to follow</p>
				<div className='flex flex-col gap-4'>
					{/* item */}
					{isLoading && (
						Array(4).fill(<RightPanelSkeleton />).map((elt, index) => (
							<React.Fragment key={index}>{elt}</React.Fragment>
						))
					)}
					{!isLoading &&
						suggestedUsers?.map((user) => (
							<Link
								to={`/profile/${user.username}`}
								className='flex items-center justify-between gap-4'
								key={user._id}
							>
								<div className='flex gap-2 items-center'>
									<div className='avatar'>
										<div className='w-8 rounded-full'>
											<img src={user.profileImg || "/avatar-placeholder.png"} loading="lazy" />
										</div>
									</div>
									<div className='flex flex-col'>
										<span className='font-semibold tracking-tight truncate w-28'>
											{user.fullName}
										</span>
										<span className='text-sm text-slate-500'>@{user.username}</span>
									</div>
								</div>
								<div>
									<button
										className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'
										onClick={(e) => {
											e.preventDefault();
											follow(user._id);
										}}
									>
										{isPending ? <LoadingSpinner size="sm" /> : "follow"}
									</button>
								</div>
							</Link>
						))}
				</div>
			</div>
		</div>
	);
};

export default RightPanel;
