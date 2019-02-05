import React, { Component } from 'react';
import ReactGA from 'react-ga';
import Autosuggester from 'react-autosuggest';
import remove from 'lodash/remove';
import { DataTable, TableBody, TableRow, TableColumn } from 'react-md';

class Autosuggest extends Component {
  constructor() {
    super();

    this.state = {
      value: '',
      suggestions: [],
    };
  }

  // https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
  escapeRegexCharacters = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  getSuggestions = value => {
    const escapedValue = this.escapeRegexCharacters(value.trim());

    if (escapedValue === '') {
      return [];
    }

    const regex = new RegExp('^' + escapedValue, 'i');
    const fields = this.props.project.firebaseFields;
    remove(fields, field => field === 'timestamp');

    return this.props.items.filter(item => {
      const result = fields.find(field => regex.test(item[field]));
      return !!result;
    });
  };

  onChange = (event, { newValue, method }) => {
    this.setState({ value: newValue });
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({ suggestions: this.getSuggestions(value) });
  };

  onSuggestionsClearRequested = () => {
    this.setState({ suggestions: [] });
  };

  onSuggestionSelected = (event, { suggestion }) => {
    this.props.onSelect(suggestion);
    ReactGA.event({
      category: 'Search',
      action: 'Selected search suggestion',
      label: `Container ID ${suggestion.containerId}`
    });
  };

  getSectionSuggestions = section => [section];

  getSuggestionValue = suggestion => suggestion.containerId;

  renderSuggestion = suggestion => (
    <DataTable plain>
      <TableBody>
        <TableRow key={suggestion.containerId}>
          {this.props.project.listPage.body.map((entry, index) => (
            <TableColumn
              key={`${suggestion.containerId}-${index}`}
              className={index === 1 ? 'md-text-center' : index === 2 ? 'md-text-right' : ''}
            >
              {typeof entry === 'string'
                ? suggestion[entry]
                : entry.map(field => suggestion[field]).join(' → ')}
            </TableColumn>
          ))}
        </TableRow>
      </TableBody>
    </DataTable>
  );

  render() {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: `Search for ${this.props.trackingUnit}s`,
      value,
      onChange: this.onChange,
    };

    return (
      <Autosuggester
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        onSuggestionSelected={this.onSuggestionSelected}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={this.renderSuggestion}
        getSectionSuggestions={this.getSectionSuggestions}
        inputProps={inputProps}
      />
    );
  }
}

export default Autosuggest;
