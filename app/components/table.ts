import Component from "@glimmer/component";
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

interface Data {
  header?: string[];
  body?: string[];
}

interface Args {
  data?: Data;
  title?: string;
  empty?: string;
}

function sortColumn(body, columnIndex, lastSelectedColumn) {
  return body.sort((columnA, columnB) => {
    if (columnA[columnIndex] === columnB[columnIndex]) {
      return 0;
    }
    else {
      if(typeof columnA[columnIndex] === 'string') {
        // we want to change the direction of the sort depending on if we clicked this column before
        if(lastSelectedColumn === columnIndex) {
          return ('' + columnA[columnIndex]).localeCompare(columnB[columnIndex]);
        }

        return ('' + columnB[columnIndex]).localeCompare(columnA[columnIndex]);
      }

      // we want to change the direction of the sort depending on if we clicked this column before
      if(lastSelectedColumn === columnIndex) {
        return columnA[columnIndex] > columnB[columnIndex];
      }

      return columnB[columnIndex] - columnA[columnIndex];
    }
  });
}

export default class Table extends Component<Args> {
  @tracked
  lastSelectedColumn = null;

  @tracked
  currentSelectedColumn = null;

  @tracked
  isCollapsed = true; // will condense the table to only show the first 10 results

  @action
  uncollapse() {
    this.isCollapsed = false;
  }

  @action
  sortColumn(columnIndex) {
    this.lastSelectedColumn = this.lastSelectedColumn === columnIndex ? null : columnIndex;
    this.currentSelectedColumn = columnIndex;
  }

  get body() {
    if(this.currentSelectedColumn !== null) {
      return sortColumn(this.args.data.body, this.currentSelectedColumn, this.lastSelectedColumn) || [];
    }

    return this.args.data.body || [];
  }

  get header() {
    return this.args.data.header || [];
  }

  // should return the width of the table based on the number of elements in the first result
  get width() {
    return this.body[0] && this.body[0].length || 0;
  }

  get csv() {
    const header = this.header;
    const body = this.body;

    let csvString = "";

    csvString += header.map((h) => h).join(',') + '\n';
    csvString += body.map((row) => {
      const rowValue = [];

      for (const column of row) {
        let value = column ? column.text || column : 'N/A';

        // we want to make sure we remove all new lines from string values
        if (typeof value === 'string') {
          value = value.replace(/\n/g, " ")
        }

        rowValue.push("'" + value + "'");
      }

      return rowValue.join(',');
    }).join('\n');

    return "data:text/csv;charset=utf-8," + encodeURI(csvString);
  }
}
