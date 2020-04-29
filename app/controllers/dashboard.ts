import Controller from '@ember/controller';
import { FS } from "types";

interface Args {
  fs?: FS;
}

export default class DashboardController extends Controller<Args> {
  get fs() {
    const fs = this.model.totalFs;

    const body = Object.keys(fs)
      .filter((key) => {
        const item = fs[key];

        return item && item.time;
      })
      .sort((keyA, keyB) => {
        const rowA = fs[keyA];
        const rowB = fs[keyB];

        return rowB.time - rowA.time;
      })
      .map((key) => {
        const { time, count } = fs[key];
        // time is ns and we want to convert to ms
        return [key, `${time / 1000000}ms`, count];
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
}
