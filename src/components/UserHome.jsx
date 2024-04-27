import React, { useState, useEffect } from "react";
import { Button, Typography } from "@material-tailwind/react";
import {
  ref,
  listAll,
  uploadBytes,
  deleteObject,
  getDownloadURL,
} from "firebase/storage";
import { useAuth } from "../hooks";
import { useNavigate } from "react-router-dom";
import { signOut, updateProfile } from "firebase/auth";
import { auth } from "../firebase/config";
import { Edit } from "@mui/icons-material";

const UserHome = () => {
  const { currentUser, storage } = useAuth();
  const [userFolderRef, setUserFolderRef] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [currentPath, setCurrentPath] = useState("Root");
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [fileUploadError, setFileUploadError] = useState("");
  const [isLoading, setIsloading] = useState(false);

  const nav = useNavigate();

  useEffect(() => {
    if (currentUser) {
      const userEmail = currentUser.email;
      const sanitizedEmail = userEmail.replace(/[.@]/g, "_");
      const userFolder = ref(storage, `users/${sanitizedEmail}`);
      setUserFolderRef(userFolder);
      setCurrentFolder(userFolder);
      loadContent(userFolder);
    }
  }, [currentUser, storage]);

  const loadContent = async (folderRef) => {
    try {
      setIsloading(true);
      const folderSnapshot = await listAll(folderRef);

      const folderData = folderSnapshot.prefixes.map((prefixRef) => ({
        id: prefixRef.fullPath,
        name: prefixRef.name,
        type: "folder",
      }));

      const fileData = folderSnapshot.items
        .filter((itemRef) => !itemRef.name.startsWith(".placeholder"))
        .map((itemRef) => ({
          id: itemRef.fullPath,
          name: itemRef.name,
          type: "file",
        }));

      setFolders(folderData);
      setFiles(fileData);
      setIsloading(false);
    } catch (error) {
      console.error("Error loading content:", error);
    }
  };

  const navigateToFolder = async (folderId, folderName) => {
    if (folderId && folderId.startsWith(userFolderRef.fullPath)) {
      const folderRef = ref(storage, folderId);
      setCurrentFolder(folderRef);
      setCurrentPath((prevPath) => `${prevPath}/${folderName}`);
      loadContent(folderRef);
    } else {
      console.warn("Invalid folder navigation attempt.");
    }
  };

  const handleBack = async () => {
    if (currentFolder !== userFolderRef) {
      const parentRef = ref(currentFolder.parent);

      if (parentRef.fullPath.startsWith(userFolderRef.fullPath)) {
        setCurrentFolder(parentRef);

        try {
          const parentSnapshot = await listAll(parentRef);

          const parentFolderData = parentSnapshot.prefixes.map((prefixRef) => ({
            id: prefixRef.fullPath,
            name: prefixRef.name,
            type: "folder",
          }));

          const parentFileData = parentSnapshot.items
            .filter((itemRef) => !itemRef.name.startsWith(".placeholder"))
            .map((itemRef) => ({
              id: itemRef.fullPath,
              name: itemRef.name,
              type: "file",
            }));

          setFolders(parentFolderData);
          setFiles(parentFileData);

          setCurrentPath((prevPath) => {
            const pathArr = prevPath.split("/");
            pathArr.pop();
            const newPath = pathArr.join("/");
            return newPath || "Root";
          });
        } catch (error) {
          console.error("Error loading parent folder:", error);
        }
      } else {
        console.warn("Invalid back navigation attempt.");
      }
    }
  };

  const logOut = () => {
    signOut(auth);
    nav("/login");
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name;
    const fileRef = ref(currentFolder, fileName);

    try {
      await uploadBytes(fileRef, file);
      setFileUploadError("");
      loadContent(currentFolder);
    } catch (error) {
      console.error("Error uploading file:", error);
      setFileUploadError("Failed to upload file. Please try again.");
    }
  };

  const createFolder = async () => {
    const folderName = prompt("Enter folder name:");
    if (folderName && currentFolder) {
      const newFolderRef = ref(currentFolder, folderName);

      try {
        await uploadBytes(ref(newFolderRef, ".placeholder"), new Uint8Array(0));
        const updatedFolders = [
          ...folders,
          { id: newFolderRef.fullPath, name: folderName, type: "folder" },
        ];
        setFolders(updatedFolders);
      } catch (error) {
        console.error("Error creating folder:", error);
      }
    }
  };

  const deleteFile = async (fileId, fileName) => {
    if (fileId) {
      try {
        const fileRef = ref(storage, fileId);
        await deleteObject(fileRef);
        const updatedFiles = files.filter((file) => file.id !== fileId);
        setFiles(updatedFiles);
        setCurrentPath((prevPath) => {
          const pathArr = prevPath.split("/");
          const newPath = pathArr.filter((part) => part !== fileName).join("/");
          return newPath || "Root";
        });
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  };

  const openFile = async (fileId) => {
    try {
      const fileRef = ref(storage, fileId);
      const url = await getDownloadURL(fileRef);

      window.open(url, "_blank");

      console.log("Opened file:", fileId);
    } catch (error) {
      console.error("Error opening file:", error);
    }
  };

  const changeName = () => {
    const newName = prompt("Enter new name:");

    if (newName) {
      updateProfile(auth.currentUser, {
        displayName: newName,
      })
        .then(() => {
          const updatedUser = auth.currentUser;
          updatedUser.displayName = newName;
          window.location.reload();
          setUser(updatedUser);
        })
        .catch((error) => console.log(error));
    }
  };

  return (
    <div>
      {isLoading && (
        <div className="text-center w-full h-full bg-blue-gray-600 absolute z-50 justify-center align-middle p-48 text-4xl">
          Loading...
        </div>
      )}
      <header className="flex justify-between items-center p-4 pt-6 pl-12 pr-12 ">
        <div className="flex flex-row gap-5 align-middle">
          <Typography className="text-4xl pt-1">
            {currentUser?.displayName}
          </Typography>
          <Button onClick={() => changeName()}>
            <Edit />
          </Button>
        </div>
        <Button color="gray" onClick={() => logOut()}>
          Logout
        </Button>
      </header>
      <div className="flex justify-end p-4">
        <Button color="blue" onClick={createFolder}>
          Create Folder
        </Button>
        <label className="relative cursor-pointer ml-4">
          <input
            id="fileInput"
            type="file"
            className="hidden"
            onChange={uploadFile}
          />
          <Button
            color="teal"
            onClick={() => document.getElementById("fileInput").click()}
          >
            Upload File
          </Button>
        </label>
      </div>
      <div className="mb-4 p-11 pb-0 pt-0">
        <Typography className="text-xl">Current Path: {currentPath}</Typography>
        <Button color="gray" onClick={handleBack}>
          Back
        </Button>
      </div>
      {fileUploadError && (
        <div className="text-red-500 font-medium mt-2 mb-4">
          {fileUploadError}
        </div>
      )}
      <div className="p-4 pl-11 pr-11">
        <h2 className="text-xl font-bold mb-4">Folders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="p-4 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300"
              onClick={() => navigateToFolder(folder.id, folder.name)}
            >
              <Typography>{folder.name}</Typography>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 pl-11 pr-11">
        <h2 className="text-xl font-bold mb-4">Files</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div key={file.id} className="p-4 bg-gray-200 rounded-lg">
              <Typography>{file.name}</Typography>
              <Button color="blue" onClick={() => openFile(file.id)}>
                Open
              </Button>
              <Button
                color="red"
                onClick={() => deleteFile(file.id, file.name)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserHome;
