import React, { Component } from 'react';
import { sha256 } from 'js-sha256';
import { toast } from 'react-toastify';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondImagePreview from 'filepond-plugin-image-preview';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import Notification from '../../SharedComponents/Notification';
import { getFileStorageReference } from '../../utils/firebase';
import '../../assets/scss/fileUpload.scss';

registerPlugin(FilePondImagePreview);

class FileUpload extends Component {
  state = {
    metadata: [],
  };

  notifyWarning = message => toast.warn(message);

  calculateHash = async file => {
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
  handleProcess = (fieldName, file, metadata, load, error, progress, abort) => {
    const { existingDocuments, pathTofile, uploadComplete } = this.props;

    let fileExists = false;
    existingDocuments.forEach(existingDocument => {
      if (existingDocument.name === file.name) {
        this.notifyWarning(`Document named ${file.name} already exists`);
        abort(`Document named ${file.name} already exists`);
        fileExists = true;
        return;
      }
    });

    if (fileExists) {
      abort(`Document named ${file.name} already exists`);
    }

    this.calculateHash(file).then(sha256Hash => {
      const storageRef = getFileStorageReference(pathTofile, file.name);
      const task = storageRef.put(file);

      if (!sha256Hash) {
        error('Upload error');
      }

      task.on(
        'state_changed',
        snapshot => {
          // Call the progress method to update the progress to 100% before calling load
          // API: progress(endlessMode, processedSize, totalSize)
          progress(true, snapshot.bytesTransferred, snapshot.totalBytes);
        },
        error => {
          error('Upload error');
        },
        () => {
          // Success
          const { metadata } = task.snapshot;

          // Call the load method when done and pass the returned server file id
          // The file is then marked as complete
          load(metadata.name);

          // Collect metadata
          const fileMetadata = {
            sha256Hash,
            name: metadata.name,
            size: metadata.size,
            contentType: metadata.contentType,
            fullPath: metadata.fullPath,
            downloadURL: metadata.downloadURLs[0],
            md5Hash: metadata.md5Hash,
            timestamp: metadata.generation,
            created: metadata.timeCreated,
            updated: metadata.updated,
          };

          // Determine total number of files. Return once all files are processed
          this.setState({ metadata: [...this.state.metadata, fileMetadata] }, () => {
            const totalFiles = this.pond.getFiles().length;
            if (this.state.metadata.length === totalFiles) {
              uploadComplete(this.state.metadata);
            }
          });
        }
      );
    });
  };

  render() {
    return (
      <div>
        <FilePond
          ref={ref => (this.pond = ref)}
          allowMultiple
          maxFiles={5}
          server={{ process: this.handleProcess }}
        />
        <Notification />
      </div>
    );
  }
}

export default FileUpload;
