import React, { Suspense, useContext } from 'react';
import { DataTable, TableBody } from 'react-md';
import FilesUpload from './FilesUpload';
import Document from './Document';
import Loader from '../../SharedComponents/Loader';
import { UserContext } from '../../contexts/user.provider';
import { ProjectContext } from '../../contexts/project.provider';

const Documents = ({ item, fileUploadEnabled, onUploadComplete }) => {

  const { user } = useContext(UserContext);
  const { project: { documentStorage, trackingUnit } } = useContext(ProjectContext);

  return (
    <div className="documents-wrapper">
      <Suspense maxDuration={1000} fallback={<Loader showLoader />}>
        <DataTable plain>
          <TableBody>
            {item.documents.map((document, index) => (
              <Document key={`${document.name}-${index}`} document={document} />
            ))}
          </TableBody>
        </DataTable>
        {documentStorage && fileUploadEnabled && user.canUploadDocuments ? (
          <FilesUpload
            uploadComplete={onUploadComplete}
            pathTofile={`${trackingUnit.replace(/\s/g, '')}/${item.containerId}`}
            existingDocuments={item.documents}
          />
        ) : null}
      </Suspense>
    </div>
  );
}


export default Documents;
