import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IoMdImage } from "react-icons/io";

export default function StoryModal({ isOpen, onClose }) {

    const URL = import.meta.env.VITE_URL

    const [text, setText] = useState("");
    const [img, setImg] = useState(null);
    const storyRef = useRef(null)

    const queryClient = useQueryClient()

    const { mutate: createStory, isPending, isError, error } = useMutation({
        mutationFn: async ({ text, img }) => {
            try {
                const res = await fetch(`${URL}/api/story/create`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        'Content-Type': "application/json",
                        "auth-token": localStorage.getItem("auth-token")
                    },
                    body: JSON.stringify({ text, img })
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
        onSuccess: () => {
            setText("");
            setImg(null);
            toast.success("Story created successfully");
            queryClient.invalidateQueries({ queryKey: ["userProfile"] })
            queryClient.invalidateQueries({ queryKey: ["userStory"] })
            onClose(false)
        }
    });

    const handleStorySubmit = (e) => {
        e.preventDefault();
        createStory({ text, img });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed z-10 inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg h-[500px] shadow-lg max-w-sm w-full relative">
                
                {/* Header Section */}
                <div className="flex justify-between items-center p-2">
                    <h2 className="text-black text-[22px] text-center font-bold">Your Story</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Image and Text Upload Section */}
                <div className="w-full h-[200px] relative flex flex-col justify-center items-center border-2 border-dashed border-gray-300 rounded-lg mb-2">
                    {!img && (
                        <div className="text-center text-black">
                            <IoMdImage size={40} className="text-gray-400 m-auto" />
                            <button
                                onClick={() => storyRef.current.click()}
                                className="text-white bg-primary py-1 px-2 rounded-lg mt-2"
                            >
                                Select from Gallery
                            </button>
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                ref={storyRef}
                                onChange={handleImageChange}
                            />
                        </div>
                    )}
                    {img && (
                        <div className="relative">
                            <img src={img} alt="Preview" className="max-w-full h-[150px] rounded-lg" />
                            <button
                                onClick={() => setImg(null)}
                                className="absolute top-2 right-2 text-white bg-black bg-opacity-50 p-1 rounded-full"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Text Upload Section */}
                <textarea
                    className="w-full border-2 border-gray-300 bg-white outline-none rounded-lg p-2 mb-2 h-[150px] text-black resize-none"
                    maxLength={200}
                    placeholder="Enter Text..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                {/* Submit Button */}
                <button
                    type="submit"
                    className={`w-full py-2 rounded-lg text-white ${isPending ? 'bg-gray-500' : 'bg-primary hover:bg-blue-700'}`}
                    disabled={isPending}
                    onClick={handleStorySubmit}
                >
                    {isPending ? 'Uploading...' : 'Add to Story'}
                </button>

                {isError && <p className="text-red-500 mt-2">{error.message}</p>}
            </div>
        </div>
    );
}
