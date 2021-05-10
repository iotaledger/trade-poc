import React, { useState } from 'react';
import ReactGA from 'react-ga';
import Autosuggester from 'react-autosuggest';
import remove from 'lodash/remove';
import { DataTable, TableBody, TableRow, TableColumn } from 'react-md';

const Autosuggest = ({ project, items, onSelect, trackingUnit }) => {

  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);


  // https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
  const escapeRegexCharacters = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const getSuggestions = inputText => {
    const escapedValue = escapeRegexCharacters(inputText.trim());

    if (escapedValue === '') {
      return [];
    }

    const regex = new RegExp('^' + escapedValue, 'i');
    const fields = project.firebaseFields;
    remove(fields, field => field === 'timestamp');

    return items.filter(item => {
      const result = fields.find(field => regex.test(item[field]));
      return !!result;
    });
  };

  const onChange = (event, { newValue, method }) => {
    setValue(newValue);
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    onSelect(suggestion);
    ReactGA.event({
      category: 'Search',
      action: 'Selected search suggestion',
      label: `Container ID ${suggestion.containerId}`
    });
  };

  const getSectionSuggestions = section => [section];

  const getSuggestionValue = suggestion => suggestion.containerId;

  const renderSuggestion = suggestion => (
    <DataTable plain>
      <TableBody>
        <TableRow key={suggestion.containerId}>
          {project.listPage.body.map((entry, index) => (
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


  const inputProps = {
    placeholder: `Search for ${trackingUnit}s`,
    value,
    onChange: onChange,
  };

  return (
    <Autosuggester
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      onSuggestionSelected={onSuggestionSelected}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      getSectionSuggestions={getSectionSuggestions}
      inputProps={inputProps}
    />
  );
}

export default Autosuggest;
