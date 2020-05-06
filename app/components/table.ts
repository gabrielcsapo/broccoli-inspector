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

function sortRow(lastSelectedColumn, columnIndex, columnA, columnB) {
  if (columnA === columnB) {
    return 0;
  }

  if(typeof columnA === 'string') {
    // we want to change the direction of the sort depending on if we clicked this column before
    if(lastSelectedColumn === columnIndex) {
      return ('' + columnA).localeCompare(columnB);
    }

    return ('' + columnB).localeCompare(columnA);
  }

  if(typeof columnA === 'number') {
    // we want to change the direction of the sort depending on if we clicked this column before
    if(lastSelectedColumn === columnIndex) {
      return columnA - columnB;
    }

    return columnB - columnA;
  }
}

function sortColumn(body, columnIndex, lastSelectedColumn) {
  return body.sort((columnA, columnB) => {
    return sortRow(lastSelectedColumn, columnIndex, columnA[columnIndex].raw || columnA[columnIndex].text || columnA[columnIndex], columnB[columnIndex].raw || columnB[columnIndex].text || columnB[columnIndex]);
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

  @action
  onClick(e) {
    if(this.args.onClick) {
      this.args.onClick(e);
    }
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
