import React, { Component } from 'react';
import { connect } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import { DataTable, TableBody, TableRow, TableColumn, FontIcon } from 'react-md';
import FilesUpload from './FilesUpload';
import { validateIntegrity } from './DocumentIntegrityValidator';

class Documents extends Component {
  state = {
    documents: [],
  };

  componentDidMount() {
    this.generateDocumentList(this.props.item);
  }

  componentWillReceiveProps(nextProps) {
    this.generateDocumentList(nextProps.item);
  }

  generateDocumentList = item => {
    if (!isEmpty(item) && item.documents) {
      const documents = [];
      item.documents.forEach(async document => {
        const result = await validateIntegrity(document);
        documents.push({...document, ...result});
        this.setState({ documents });
      });
    }
  }

  getDocumentIcon = doc => {
    switch (doc.contentType) {
      case 'application/pdf':
        return 'pdf';
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/x-iwork-pages-sffpages':
        return 'doc';
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'application/x-iwork-keynote-sffnumbers':
        return 'excel';
      default:
        return 'img';
    }
  };

  render() {
    const {
      item,
      fileUploadEnabled,
      onUploadComplete,
      user,
      project: { documentStorage, trackingUnit }
    } = this.props;
    const { documents } = this.state;

    if (!documents) return <React.Fragment />

    return (
      <div className="documents-wrapper">
        <DataTable plain>
          <TableBody>
            {documents.map((doc, index) => (
              <TableRow key={`${doc.name}-${index}`}>
                <TableColumn>
                  <a
                    className={`icon ${this.getDocumentIcon(doc)}`}
                    href={doc.downloadURL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {doc.name}
                  </a>
                </TableColumn>
                <TableColumn className="md-text-right">
                  {doc.hashMatch && doc.sizeMatch ? (
                    <FontIcon secondary>done</FontIcon>
                  ) : (
                    <FontIcon error>block</FontIcon>
                  )}
                </TableColumn>
              </TableRow>
            ))}
          </TableBody>
        </DataTable>
        {documentStorage && fileUploadEnabled && user.canUploadDocuments ? (
          <FilesUpload
            uploadComplete={onUploadComplete}
            pathTofile={`${trackingUnit.replace(/\s/g, '')}/${item.containerId}`}
            existingDocuments={documents}
          />
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  project: state.project,
  user: state.user
});

export default connect(mapStateToProps)(Documents);
