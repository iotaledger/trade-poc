import React, { Component, lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import { DataTable, TableBody } from 'react-md';
import FilesUpload from './FilesUpload';
import Loader from '../../SharedComponents/Loader';

const Document = lazy(() => import('./Document'));

class Documents extends Component {
  render() {
    const {
      item,
      fileUploadEnabled,
      onUploadComplete,
      user,
      project: { documentStorage, trackingUnit }
    } = this.props;

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
}

const mapStateToProps = state => ({
  project: state.project,
  user: state.user
});

export default connect(mapStateToProps)(Documents);
