import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';

import gt from 'broccoli-inspector/helpers/gt';
import and from 'broccoli-inspector/helpers/and';
import html from 'broccoli-inspector/helpers/html';
import eq from 'broccoli-inspector/helpers/eq';
import sub from 'broccoli-inspector/helpers/sub';

import CollapsableComponent from './collapsable-component';

import PaperToolbar from 'ember-paper/components/paper-toolbar';
import PaperToolbarTools from 'ember-paper/components/paper-toolbar-tools';
import PaperButton from 'ember-paper/components/paper-button';
import PaperIcon from 'ember-paper/components/paper-icon';
import PaperTooltip from 'ember-paper/components/paper-tooltip';
import HrefTo from 'ember-href-to/helpers/href-to';

interface Data {
  header?: string[];
  body?: string[];
}

interface Args {
  data?: Data;
  title?: string;
  empty?: string;
  onClick?: (e: any) => void;
}

type Column = {
  raw: string;
  text: string;
};

function sortRow(
  lastSelectedColumn: number | null,
  columnIndex: number,
  columnA: any,
  columnB: any
) {
  if (columnA === columnB) {
    return 0;
  }

  if (typeof columnA === 'string') {
    // we want to change the direction of the sort depending on if we clicked this column before
    if (lastSelectedColumn === columnIndex) {
      return ('' + columnA).localeCompare(columnB);
    }

    return ('' + columnB).localeCompare(columnA);
  }

  if (typeof columnA === 'number') {
    // we want to change the direction of the sort depending on if we clicked this column before
    if (lastSelectedColumn === columnIndex) {
      return columnA - columnB;
    }

    return columnB - columnA;
  }

  return 0;
}

function getColumnValue(column: Column) {
  if (column.raw !== undefined) return column.raw;
  if (column.text !== undefined) return column.text;
  if (column !== undefined) return column;
  return 'N/A';
}

function sortColumn(
  body: any[],
  columnIndex: number,
  lastSelectedColumn: number | null
) {
  return body.sort((columnA: any, columnB: any) => {
    return sortRow(
      lastSelectedColumn,
      columnIndex,
      getColumnValue(columnA[columnIndex]),
      getColumnValue(columnB[columnIndex])
    );
  });
}

class TableTag extends Component<{ tag: string; text: string }> {
  <template>
    {{#if (eq @tag "pre")}}
      <pre>{{#if @tag}}{{html @text}}{{else}}{{@text}}{{/if}}</pre>
    {{else}}
      <span>{{#if @tag}}{{html @text}}{{else}}{{@text}}{{/if}}</span>
    {{/if}}
  </template>
}

class TableRow extends Component<{ onClick: void; items: any[] }> {
  <template>
    <tr {{on "click" @onClick}}>
      {{#each @items as |item|}}
        {{#if item.linkRoute}}
          <td>
            <a href={{HrefTo item.linkRoute item.linkModel}}>
              {{item.text}}
            </a>
          </td>
        {{else if item.tag}}
          <td>
            <TableTag @tag={{item.tag}} @text={{item.text}} />
          </td>
        {{else if item.text}}
          <td>{{item.text}}</td>
        {{else}}
          <td>{{item}}</td>
        {{/if}}
      {{/each}}
    </tr>
  </template>
}

export default class Table extends CollapsableComponent<Args> {
  @tracked
  lastSelectedColumn: number | null = null;

  @tracked
  currentSelectedColumn: number | null = null;

  @tracked
  tableCollapsed = false;

  constructor(...args: any) {
    // @ts-ignore
    super(...args);
  }

  @action
  toggleCollapseTable() {
    this.tableCollapsed = !this.tableCollapsed;
  }

  @action
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  @action
  sortColumn(columnIndex: number) {
    this.lastSelectedColumn =
      this.lastSelectedColumn === columnIndex ? null : columnIndex;
    this.currentSelectedColumn = columnIndex;
  }

  @action
  onClick(e: any) {
    if (this.args.onClick) {
      this.args.onClick(e);
    }
  }

  get body() {
    if (
      this.currentSelectedColumn !== null &&
      this.args.data &&
      this.args.data.body
    ) {
      return (
        sortColumn(
          this.args.data.body,
          this.currentSelectedColumn,
          this.lastSelectedColumn
        ) || []
      );
    }

    return this.args.data?.body || [];
  }

  get header() {
    return this.args.data?.header || [];
  }

  // should return the width of the table based on the number of elements in the first result
  get width() {
    return (
      (this.args.data?.body &&
        this.args.data?.body[0] &&
        this.args.data.body[0].length) ||
      0
    );
  }

  get csv() {
    const header = this.header;
    const body = this.body;

    let csvString = '';

    csvString += header.map((h) => h).join(',') + '\n';
    csvString += body
      .map((row: any) => {
        const rowValue = [];

        for (const column of row) {
          let value = column ? column.text || column : 'N/A';

          // we want to make sure we remove all new lines from string values
          if (typeof value === 'string') {
            value = value.replace(/\n/g, ' ');
          }

          rowValue.push("'" + value + "'");
        }

        return rowValue.join(',');
      })
      .join('\n');

    return 'data:text/csv;charset=utf-8,' + encodeURI(csvString);
  }

  <template>
    <PaperToolbar>
      <PaperToolbarTools>
        <h2>
          {{@title}}
        </h2>
        <span class="flex"></span>
        <PaperButton @onClick={{this.toggleCollapseTable}} @iconButton={{true}}>
          {{#if this.tableCollapsed}}
            {{PaperIcon "expand_more"}}
          {{else}}
            {{PaperIcon "expand_less"}}
          {{/if}}
        </PaperButton>
        <PaperButton @href={{this.csv}} @target="_blank" @iconButton={{true}}>
          {{PaperIcon "link"}}

          <PaperTooltip @position="bottom">
            Download data as a CSV
          </PaperTooltip>
        </PaperButton>
      </PaperToolbarTools>
    </PaperToolbar>
    {{#unless this.tableCollapsed}}
      <table class="table">
        <thead>
          <tr>
            {{#each this.header as |header index|}}
              <th {{on "click" (fn this.sortColumn index)}}>
                {{header}}
                {{#if (eq index this.currentSelectedColumn)}}
                  {{#if (eq index this.lastSelectedColumn)}}
                    &nbsp;
                    {{PaperIcon "arrow_drop_up"}}
                  {{else}}
                    &nbsp;
                    {{PaperIcon "arrow_drop_down"}}
                  {{/if}}
                {{/if}}
              </th>
            {{/each}}
          </tr>
        </thead>
        <tbody>
          {{#if this.body}}
            {{#each this.body as |items|}}
              <TableRow @items={{items}} @onClick={{this.onClick}} />
            {{/each}}

            {{#if (and this.isCollapsed (gt @data.body.length 10))}}
              <tr>
                <td colspan={{this.width}} class="text-center">
                  <PaperButton
                    @raised={{true}}
                    @onClick={{this.toggleCollapse}}
                  >Show {{sub @data.body.length 10}} more rows</PaperButton>
                </td>
              </tr>
            {{/if}}

            {{#unless this.isCollapsed}}
              <tr>
                <td colspan={{this.width}} class="text-center">
                  <PaperButton
                    @raised={{true}}
                    @onClick={{this.toggleCollapse}}
                  >Show {{sub this.body.length 10}} less rows</PaperButton>
                </td>
              </tr>
            {{/unless}}
          {{else}}
            <tr>
              <td class="text-center" colspan={{this.header.length}}>
                {{@empty}}
              </td>
            </tr>
          {{/if}}
        </tbody>
      </table>
    {{/unless}}
  </template>
}
