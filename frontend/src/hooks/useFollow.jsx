import {useMutation, useQueryClient} from "@tanstack/react-query" 
import toast from "react-hot-toast";

const usefollow = ()=>{

    const URL = import.meta.env.VITE_URL


    const queryClient = useQueryClient();

    const {mutate:follow, isPending} = useMutation({
        mutationFn: async(userId)=>{
            try {
                const res = await fetch(`${URL}/api/users/follow/${userId}`,{
                    method: "POST",
                    credentials:"include",
                })
                const data = await res.json()
                if(!res.ok){
                    throw new Error(data.error || "Something went wrong")
                }
                return data
            } catch (error) {
                throw new Error(error)
            }
        },
        onSuccess: ()=>{
            Promise.all([
                queryClient.invalidateQueries(["suggestedUsers"]),
                queryClient.invalidateQueries(["authUser"])
            ])
        },
        onError: (error)=>{
            toast.error(error.message)
        }

    })

    return {follow, isPending}
}

export default usefollow