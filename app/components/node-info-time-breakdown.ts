import Component from "@glimmer/component";
import { tracked } from '@glimmer/tracking';

import { type FS} from 'broccoli-inspector/types';

interface Args {
  fs?: FS;
  selfTime: number;
}

export default class NodeInfoTimeBreakdown extends Component<Args> {
  chart = null;

  title = { text: "" };
  padding = { top: 20 };

  @tracked
  selectedTab = 0;

  get fs() {
    const fs = this.args?.fs || {}

    const body = Object.keys(fs)
      .filter((key) => {
        const item = (fs as any)[key];

        return item && item.time;
      })
      .sort((keyA, keyB) => {
        const rowA = (fs as any)[keyA];
        const rowB = (fs as any)[keyB];

        return rowB.time - rowA.time;
      })
      .map((key) => {
        const { time, count } = (fs as any)[key];
        // time is ns and we want to convert to ms
        return [key, { raw: time, text: `${time / 1000000}ms` }, count];
      });

    return {
      header: [
        `Operation`,
        `Time`,
        `Count`
      ],
      body
    }
  }

  onclick(...args: any) {
    console.log(args)
  }

  get data() {
    const fs = this.args?.fs || {};
    const selfTime = this.args.selfTime;

    let fsTime = 0;

    for (const operation in fs) {
      if (!(fs as any)[operation] || !(fs as any)[operation].time) continue;
      fsTime += (fs as any)[operation].time;
    }

    return {
      columns: [
        ["FS", fsTime / 1000000],
        ["Other", selfTime - (fsTime / 1000000)]
      ],
      type: "pie",
      onclick: this.onclick
    }
  }

  get tooltip() {
    return {
      format: {
        value: function (value: string, ratio: number) {
          return `${value}ms | ${Number(ratio * 100).toFixed(0)}%`;
        }
      }
    };
  }

  get pie() {
    return {
      label: {
        format: function(value: string) {
          return value;
        }
      }
    }
  }
}
