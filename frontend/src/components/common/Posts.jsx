import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType, username, userId }) => {

	const URL = import.meta.env.VITE_URL

	const getPostEndpoint = () => {
		switch (feedType) {
			case "forYou":
				return `${URL}/api/posts/all`;
			case "following":
				return `${URL}/api/posts/following`;
			case "posts":
				return `${URL}/api/posts/user/${username}`;
			case "likes":
				return `${URL}/api/posts/likes/${userId}`;
			default:
				return `${URL}/api/posts/all`;
		}
	};

	const POST_ENDPOINT = getPostEndpoint();

	const { data: posts, isLoading, refetch, isRefetching } = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			try {
				const res = await fetch(POST_ENDPOINT, {
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
		staleTime:600000

		
	});

	useEffect(() => {
		refetch();
	}, [feedType, refetch, username]);

	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching && posts?.length === 0 && (
				<p className='text-center my-4'>No posts in this tab. Switch 👻</p>
			)}
			{!isLoading && !isRefetching && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;