import { useState, lazy, Suspense } from "react";

const Posts = lazy(()=>import("../../components/common/Posts")) ;
const CreatePost = lazy(()=>import("./CreatePost")) ;
const Stories =  lazy(()=> import("../../components/common/Stories")) ;


const HomePage = () => {
	const [feedType, setFeedType] = useState("forYou");

	return (
		<>
			<div className='flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen max-w-[700px] '>
			 	<Suspense fallback={<></>}><Stories/></Suspense>
				{/* Header */}
				<div className='flex w-full border-b border-gray-700'>
					<div
						className={
							"flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
						}
						onClick={() => setFeedType("forYou")}
					>
						For you
						{feedType === "forYou" && (
							<div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary'></div>
						)}
					</div>
					<div
						className='flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative'
						onClick={() => setFeedType("following")}
					>
						Following
						{feedType === "following" && (
							<div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary'></div>
						)}
					</div>
				</div>

				{/*  CREATE POST INPUT */}
				<Suspense fallback={<></>}><CreatePost /></Suspense>
				

				{/* POSTS */}
				<Suspense fallback={<></>}><Posts feedType={feedType} /></Suspense>
				
			</div>
		</>
	);
};
export default HomePage;