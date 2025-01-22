import { useState, useEffect } from "react";

import toast from "react-hot-toast";

import "./style.css";
import { FaTrash, FaUpload } from "react-icons/fa";

import { MdCancel, MdFileDownload } from "react-icons/md";

function UploadForm() {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [isFileUploaded, setIsFileUploaded] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/upload/");
        const data = await response.json();
        setFiles(data);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, [isFileUploaded]);

  const validExtensions = ["mp4", "mp3", "jpeg", "png", "gif"];

  const handleFileChange = (event) => {
    const selected = event.target.files;
    const selectedFilesArray = Array.from(selected);

    // Checking if the user has selected more than 10 files
    if (selectedFilesArray.length > 10) {
      toast.error("Upto 10 files can be uploaded at a time");
      return;
    }

    // Validating each file
    const invalidFiles = selectedFilesArray.filter((file) => {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const fileSize = file.size;
      const fileType = file.type.toLowerCase();

      // Checking if file extension is valid or not from given validExtensions
      if (!validExtensions.includes(fileExtension)) {
        toast.error(`Invalid file type: ${file.name}`);
        return true;
      }

      // Checking if file size is within the valid range (100KB - 10MB)
      if (fileSize < 100000 || fileSize > 10000000) {
        toast.error(` File must be between 100KB and 10MB. ${file.name}`);
        return true;
      }

      // checking MIME type for audio and video
      if (
        (fileType.startsWith("audio/") && !["audio/mpeg"].includes(fileType)) ||
        (fileType.startsWith("video/") &&
          !["video/mp4", "video/webm"].includes(fileType))
      ) {
        toast.error(`Invalid MIME type: ${file.name}`);
        return true;
      }

      return false;
    });

    // If any file is invalid, do not update the state
    if (invalidFiles.length > 0) {
      return;
    }

    // If all files are valid, update the state
    setSelectedFiles(selectedFilesArray);
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("No files selected.");
      return;
    }

    const formData = new FormData();

    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append(`file`, selectedFiles[i]);
    }

    try {
      const response = await fetch("http://localhost:8000/api/upload/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("File uploaded successfully!");
        setIsFileUploaded(!isFileUploaded);
        setSelectedFiles(null);
      } else {
        toast.error("Error uploading file!");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Error uploading file!");
    }
  };

  const handleRemoveFile = (fileToRemove) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((file) => file !== fileToRemove)
    );
  };

  const handleFileDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/delete/${id}/`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("File removed successfully!");
        setIsFileUploaded(!isFileUploaded);
      } else {
        toast.error("Error removing file!");
      }
    } catch (error) {
      console.error("Error removing file:", error);
      toast.error("Error removing file!");
    }
  };

  const renderMedia = (file) => {
    const fileUrl = file.file.startsWith("http")
      ? file.file
      : `http://127.0.0.1:8000${file.file}`;

    const fileType = file?.file_type?.toLowerCase();
    console.log(fileType, "type");

    if (
      fileType.startsWith("image/") ||
      ["jpg", "jpeg", "png", "gif"].includes(fileType)
    ) {
      return (
        <img
          src={fileUrl}
          alt={file.file_name}
          className="max-w-full max-h-[400px] h-[300px] object-cover mx-auto rounded-t-md "
        />
      );
    } else if (
      fileType.startsWith("video/") ||
      ["mp4", "webm"].includes(fileType)
    ) {
      return (
        <video
          controls
          autoPlay
          className="w-full max-h-[400px] h-[300px] rounded-tl-md"
        >
          <source src={fileUrl} type={`video/${fileType}`} />
          Your browser does not support the video tag.
        </video>
      );
    } else if (
      fileType.startsWith("audio/") ||
      ["mp3", "m4a", "wav"].includes(fileType)
    ) {
      return (
        <audio controls autoPlay className="w-full rounded-md">
          <source src={fileUrl} type={`audio/${fileType}`} />
          Your browser does not support the audio tag.
        </audio>
      );
    } else {
      return (
        <div className="text-center">
          <p className="mb-2">File cannot be previewed directly.</p>
          <a
            href={fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Download {file.file_name}
          </a>
        </div>
      );
    }
  };

  const handleDownload = async (file) => {
    const fileUrl = file.file.startsWith("http")
      ? file.file
      : `http://127.0.0.1:8000${file.file}`;

    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col rounded-md  p-4 w-full">
      <div className="w-full flex justify-between items-center px-6 py-10">
        <div className="w-full flex flex-col gap-4">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-blue-300 rounded-lg bg-white cursor-pointer hover:bg-blue-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="p-4 mb-2 bg-blue-100 !rounded-full">
                <FaUpload className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-xl font-semibold text-blue-600">Upload File</p>
            </div>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <button
            onClick={handleFileUpload}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg w-full"
          >
            Upload
          </button>
        </div>
      </div>
      {selectedFiles && selectedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold mb-2">Selected Files</h4>
          <ul className="space-y-2 border border-gray-300 rounded-md p-4">
            {selectedFiles && selectedFiles.length > 0
              ? selectedFiles.map((file, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-gray-700">{file.name}</span>
                      <span className="text-sm text-green-500">
                        {Math.round(file.size / 1024)} KB
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(file)}
                      type="button"
                      className="!bg-none"
                    >
                      <FaTrash color="red" />
                    </button>
                  </li>
                ))
              : null}
          </ul>
        </div>
      )}
      <div className="  mt-6">
        <h3 className="font-bold text-xl py-4">All Files</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.length > 0 ? (
            files.map((file) => (
              <div
                key={file.id}
                className="group relative bg-blue-50 shadow-sm rounded-sm flex flex-col justify-center items-center"
              >
                <div className=" flex flex-col items-center gap-2">
                  {/* <span>Category: {file.category}</span> */}
                  <div className="w-full cursor-pointer aspect-video flex items-center justify-center rounded-t-md rounded-b-none group transition duration-300 ">
                    {renderMedia(file)}
                  </div>
                  <div className="flex justify-between w-full px-4 items-center space-y-4">
                    <h3 className="font-medium ">{file.file_name}</h3>
                    <button
                      // target="_blank"
                      onClick={() => handleDownload(file)}
                      className=" rounded-md text-white w-fit flex gap-2 items-center justify-center mb-4 "
                    >
                      <MdFileDownload size={20} color="blue" />{" "}
                      {/* <span>Download</span> */}
                    </button>
                  </div>

                  <div className=" absolute left-2 top-2 flex flex-wrap gap-4 text-sm text-gray-400 opacity-100 group-hover:opacity-0">
                    <span className="bg-blue-300 text-black rounded px-2">
                      {" "}
                      {Math.round(file.file_size / 1024)} KB
                    </span>
                    <span className="bg-purple-300 text-black rounded px-2">
                      .{file.file_type}
                    </span>
                    <span className="bg-yellow-300 text-black rounded px-2">
                      {file.category}
                    </span>
                  </div>

                  <div className="flex gap-2 items-center ">
                    <div
                      className="absolute top-2 right-2 bg-none group-hover:opacity-100 opacity-0 transition duration-300 cursor-pointer"
                      onClick={() => handleFileDelete(file.id)}
                    >
                      <MdCancel
                        className="cursor-pointer"
                        title="Delete File"
                        size={20}
                        color="red"
                      />
                    </div>
                    <span className="absolute top-2 left-2 bg-green-200 text-black rounded px-2 group-hover:opacity-100 opacity-0 transition duration-300 cursor-pointer">
                      Uploaded At: {new Date(file.uploaded_at).toDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No files uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadForm;
