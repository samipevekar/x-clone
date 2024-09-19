import Users from './Users'
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton"

export default function FollowersFollowingModal({ Type, data }) {
  return (
    <div>
      <dialog id="followers-following" className="modal">
        <div className="modal-box border-[1px] border-white rounded-lg">
          <div className='text-center font-bold '>
            {Type === "followers" ? "Followers" : "Following"}
          </div>
          <hr className='text-center w-[40px] m-auto h-[4px]' />
          <form method="dialog">
            {/* Button to close the modal */}
            <button className="btn btn-sm border-none outline-none btn-ghost absolute right-2 top-2">✕</button>
          </form>

          {/* If there is no data, show this message */}
          {data?.length === 0 && <div className='text-center my-4'>{Type==="followers"?"You have'nt any followers":"You have'nt any following"}</div>}

          {/* Show a skeleton while data is loading */}
          {!data && data.length===0 && <RightPanelSkeleton />}

          {/* Map through the correct data based on the Type */}
          {data && data.length > 0 && data.map((user) => (
            <Users
              key={user?._id}
              username={user?.username}
              profileImg={user?.profileImg}
              fullName={user?.fullName}
            />
          ))}
        </div>
      </dialog>
    </div>
  )
}
