import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { IoMdImage } from "react-icons/io";

export default function StoryModal({ isOpen, onClose }) {

    const URL = import.meta.env.VITE_URL

    const [text, setText] = useState("");
    const [img, setImg] = useState(null);
    const storyRef = useRef(null)
    const [uploadType, setUploadType] = useState('text'); // 'text' or 'image'

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
        if (uploadType === 'text') {
            createStory({ text, img: null });
        } else {
            createStory({ text: null, img });
        }
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
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
                <h2 className="text-[25px] text-black font-bold text-center mb-4">Create Story</h2>
                <div className="flex items-center justify-center mb-4">
                    <label className="mr-4">
                        <input
                            type="radio"
                            name="uploadType"
                            value="text"
                            checked={uploadType === 'text'}
                            onChange={() => setUploadType('text')}
                        />
                        <span className="ml-2 text-black">Text</span>
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="uploadType"
                            value="image"
                            checked={uploadType === 'image'}
                            onChange={() => setUploadType('image')}
                        />
                        <span className="ml-2 text-black">Image</span>
                    </label>
                </div>
                <form onSubmit={handleStorySubmit}>
                    {uploadType === 'text' && (
                        <textarea
                            className="w-full border resize-none h-[300px] border-gray-300 rounded-lg p-2 mb-4"
                            maxLength={300}
                            placeholder="Type here..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                    )}
                    {uploadType === 'image' && (
                        <>
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                ref={storyRef}
                                onChange={handleImageChange}
                                className="w-full mb-4"
                            />
                            <div className='text-[15px] m-auto w-fit cursor-pointer bg-primary text-white p-1 rounded my-4 ' onClick={(e) => storyRef.current.click()} ><IoMdImage /></div>
                            {img && (
                                <div className="w-full mb-4 flex justify-center">
                                    <img
                                        src={img}
                                        alt="Preview"
                                        className="max-w-full h-[250px] rounded-lg border border-gray-300"
                                        loading='lazy'
                                    />
                                </div>
                            )}
                        </>
                    )}
                    <button
                        type="submit"
                        className={`w-full mt-auto py-2 rounded-lg text-white ${isPending ? 'bg-gray-500' : 'bg-primary hover:bg-blue-700'
                            }`}
                        disabled={isPending}
                    >
                        {isPending ? 'Uploading...' : 'Upload'}
                    </button>
                    {isError && <p className="text-red-500 mt-2">{error.message}</p>}
                </form>
            </div>
        </div>
    );
}
