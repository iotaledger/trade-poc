import React, { useEffect, useRef, useState } from 'react';
import { sha256 } from 'js-sha256';
import { toast } from 'react-toastify';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondImagePreview from 'filepond-plugin-image-preview';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import Notification from '../../SharedComponents/Notification';
import { getFileStorageReference } from '../../utils/firebase';

registerPlugin(FilePondImagePreview);

const FileUpload = ({ existingDocuments, pathTofile, uploadComplete }) => {

  const [metadata, setMetadata] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const pond = useRef();


  const notifyWarning = message => toast.warn(message);

  const calculateHash = async file => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
          const arrayBuffer = reader.result;
          const hash = sha256(arrayBuffer);
          resolve(hash);
        };
      } catch (error) {
        reject(null);
      }
    });
  };

  // Params: see https://pqina.nl/filepond/docs/patterns/api/server/#advanced
  const handleProcess = (fieldName, file, metadata, load, error, progress, abort) => {

    let fileExists = false;
    existingDocuments.forEach(existingDocument => {
      if (existingDocument.name === file.name) {
        notifyWarning(`Document named ${file.name} already exists`);
        abort(`Document named ${file.name} already exists`);
        fileExists = true;
        return;
      }
    });

    if (fileExists) {
      abort(`Document named ${file.name} already exists`);
    }

    calculateHash(file).then(sha256Hash => {
      const storageRef = getFileStorageReference(pathTofile, file.name);
      const task = storageRef.put(file);

      if (!sha256Hash) {
        error('Upload error');
      }
      setIsUploading(true);
      task.on(
        'state_changed',
        snapshot => {
          // Call the progress method to update the progress to 100% before calling load
          // API: progress(endlessMode, processedSize, totalSize)
          progress(true, snapshot.bytesTransferred, snapshot.totalBytes);
        },
        () => {
          error('Upload error');
        },
        async () => {
          // Success
          const { metadata } = task.snapshot;

          // Call the load method when done and pass the returned server file id
          // The file is then marked as complete
          load(metadata.name);
          const downloadURL = await task.snapshot.ref.getDownloadURL();

          // Collect metadata
          const fileMetadata = {
            downloadURL,
            sha256Hash,
            name: metadata.name,
            size: metadata.size,
            contentType: metadata.contentType,
            fullPath: metadata.fullPath,
            md5Hash: metadata.md5Hash,
            timestamp: metadata.generation,
            created: metadata.timeCreated,
            updated: metadata.updated,
          };

          // Determine total number of files. Return once all files are processed
          setMetadata(prevMetaData => {
            return ([...prevMetaData, fileMetadata])
          });
        }
      );
    });
  };

  useEffect(() => {
    if(!isUploading) return;
    const totalFiles = pond.current.getFiles().length;
    if (metadata.length === totalFiles) {
      uploadComplete(metadata);
      setIsUploading(false);
    }
  }, [metadata]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <FilePond
        ref={ref => pond.current = ref}
        allowMultiple
        maxFiles={5}
        server={{ process: handleProcess }}
      />
      <Notification />
    </div>
  );
}

export default FileUpload;
