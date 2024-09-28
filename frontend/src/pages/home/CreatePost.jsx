import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const CreatePost = () => {
  const URL = import.meta.env.VITE_URL;

  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [audio, setAudio] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTimeout, setRecordingTimeout] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0); // Track recording time
  const [timerInterval, setTimerInterval] = useState(null);
  const imgRef = useRef(null);
  const mediaRecorderRef = useRef(null); // Use ref instead of state

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const { mutate: createPost, isPending, isError, error } = useMutation({
    mutationFn: async ({ formData }) => {
      const res = await fetch(`${URL}/api/posts/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "auth-token": localStorage.getItem("auth-token"),
        },
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      return data;
    },
    onSuccess: () => {
      setText("");
      setImg(null);
      setAudio(null);
      setAudioBlob(null); // Reset audioBlob
      toast.success("Post created successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isPending) return;

    const formData = new FormData();
    formData.append("text", text);
    if (img) formData.append("img", img);
    if (audioBlob) formData.append("audio", audioBlob);

    createPost({ formData });
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder; // Save to ref instead of state

      const audioChunks = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
        console.log("Data available, chunk added:", event.data);
      };

      recorder.onstop = () => {
        console.log("Recording stopped, processing audio");
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioUrl = window.URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob); // Save blob for uploading
        setAudio(audioUrl); // Set audio for preview
        console.log("Audio preview URL:", audioUrl);
      };

      recorder.start();
      console.log("Recorder state after start:", recorder.state);
      setIsRecording(true);

      const intervalId = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
      setTimerInterval(intervalId);

      const timeoutId = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          console.log("1 minute passed, stopping recording");
          stopRecording();
        } else {
          console.log("Recorder was not in recording state");
        }
      }, 120000); // 1 minute
      setRecordingTimeout(timeoutId);
    }).catch((error) => {
      console.error("Error accessing microphone:", error);
    });
  };

  const stopRecording = () => {
    console.log("Attempting to stop recording, recorder state:", mediaRecorderRef.current?.state);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop(); // Stop the recording
      console.log("Recording stopped by user or timeout");
      setIsRecording(false);

      clearTimeout(recordingTimeout);
      clearInterval(timerInterval);

      setRecordingTimeout(null);
      setTimerInterval(null);

      setRecordingTime(0); // Reset recording timer
    } else {
      console.log("No active recording or recording already stopped");
    }
  };

  const handleRemoveAudio = () => {
    setAudio(null);
    setAudioBlob(null);
  };

  const formatRecordingTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  return (
    <div className="flex p-4 items-start gap-4 border-b border-gray-700">
      <div className="avatar">
        <div className="w-8 rounded-full">
          <img src={authUser?.profileImg || "/avatar-placeholder.png"} />
        </div>
      </div>
      <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
        <textarea
          className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-800"
          placeholder="What is happening?"
          value={text}
          maxLength={300}
          onChange={(e) => setText(e.target.value)}
        />

        <span className="" >{text.split("").length}/300</span>

        {img && (
          <div className="relative w-72 mx-auto">
            <IoCloseSharp
              className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
              onClick={() => {
                setImg(null);
                imgRef.current.value = null;
              }}
            />
            <img
              src={img}
              className="w-full mx-auto h-72 object-contain rounded"
              loading="lazy"
            />
          </div>
        )}

        {audio && (
          <div className="relative w-full flex flex-col items-center bg-gray-800 p-2 rounded-full">
            <IoCloseSharp
              className="absolute top-0 right-0 text-white bg-gray-900 rounded-full w-5 h-5 cursor-pointer"
              onClick={handleRemoveAudio}
            />
            <audio
              controls
              src={audio}
              className="w-full bg-primary p-1 rounded-full"
              style={{ accentColor: "#4CAF50" }}
              preload="auto"
            />
          </div>
        )}

        <div className="flex justify-between border-t py-2 border-t-gray-700">
          <div className="flex gap-1 items-center">
            <CiImageOn
              className="fill-primary w-6 h-6 cursor-pointer"
              onClick={() => imgRef.current.click()}
            />
            <BsEmojiSmileFill className="fill-primary w-5 h-5 cursor-pointer" />
          </div>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={imgRef}
            onChange={handleImgChange}
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-secondary rounded-full btn-sm text-white px-4"
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? "Stop 🛑" : "Record ⏺️"}
            </button>
            {isRecording && (
              <span className="text-sm text-gray-500">
                {formatRecordingTime(recordingTime)}
              </span>
            )}
          </div>

          <button
            disabled={isPending || !text && !audio && !img}
            className="btn btn-primary rounded-full btn-sm text-white px-4"
          >
            {isPending ? "Posting..." : "Post"}
          </button>
        </div>

        {isError && <div className="text-red-500">{error.message}</div>}
      </form>
    </div>
  );
};

export default CreatePost;
