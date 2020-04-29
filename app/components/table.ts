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

export default class Table extends Component<Args> {
  @tracked
  header = this.args ?.data ?.header || [];

  @tracked
  body = this.args ?.data ?.body || [];

  @tracked
  lastSelectedColumn = null;

  @tracked
  currentSelectedColumn = null;

  @action
  sortColumn(columnIndex) {
    this.body = this.body.sort((columnA, columnB) => {
      if (columnA[columnIndex] === columnB[columnIndex]) {
        return 0;
      }
      else {
        // we want to change the direction of the sort depending on if we clicked this column before
        if(this.lastSelectedColumn === columnIndex) {
          return (columnA[columnIndex] > columnB[columnIndex]) ? -1 : 1
        }

        return (columnA[columnIndex] < columnB[columnIndex]) ? -1 : 1
      }
    });

    this.lastSelectedColumn = this.lastSelectedColumn === columnIndex ? null : columnIndex;
    this.currentSelectedColumn = columnIndex;
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
