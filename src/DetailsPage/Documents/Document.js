import React, { Component } from 'react';
import { TableRow, TableColumn, FontIcon } from 'react-md';
import { validateIntegrity } from './DocumentIntegrityValidator';

class Document extends Component {
  state = {
    document: null,
  };

  componentDidMount() {
    this.validate(this.props.document);
  }

  componentWillReceiveProps(nextProps) {
    this.validate(nextProps.document);
  }

  validate = async document => {
    const result = await validateIntegrity(document);
    this.setState({ document: {...document, ...result} });
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
    const { document } = this.state;

    if (!document) return <React.Fragment />

    return (
      <TableRow key={document.name}>
        <TableColumn>
          <a
            className={`icon ${this.getDocumentIcon(document)}`}
            href={document.downloadURL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {document.name}
          </a>
        </TableColumn>
        <TableColumn className="md-text-right">
          {document.hashMatch && document.sizeMatch ? (
            <FontIcon secondary>done</FontIcon>
          ) : (
            <FontIcon error>block</FontIcon>
          )}
        </TableColumn>
      </TableRow>
    );
  }
}

export default Document;
