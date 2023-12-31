import { parse } from "https://deno.land/std@0.192.0/datetime/mod.ts";

const main = async (args: string[]) => {
  // 入力をパース
  const targetYearMonth = parseYearMonth(args[0]);

  // 祝日一覧
  const publicHolidays = await fetchPublicHolidays(targetYearMonth);

  // 週末＋祝日から休日数を求める。週末と被った祝日は２重カウントになっているので調整する。
  const count = targetYearMonth.getWeekendCount() + publicHolidays.length - publicHolidays.getWeekendCount();

  console.log(count);
};

const Month = {
  JANUARY: 1,
  FEBRUARY: 2,
  MARCH: 3,
  APRIL: 4,
  MAY: 5,
  JUNE: 6,
  JULY: 7,
  AUGUST: 8,
  SEPTEMBER: 9,
  OCTOBER: 10,
  NOVEMBER: 11,
  DECEMBER: 12,
} as const;

type Month = (typeof Month)[keyof typeof Month];

class YearMonth {
  #year: number;
  #month: Month;

  constructor(year: number, month: Month) {
    this.#year = year;
    this.#month = month;
  }

  getYear() {
    return this.#year;
  }

  getMonth() {
    return this.#month;
  }

  getWeekendCount() {
    const targetYear = this.getYear();
    const targetMonth = this.getMonth();
    const lastDayOfMonth = new Date(targetYear, targetMonth, 0, 0).getDate();

    // 日数分の配列を作成して、配列のインデックスから日にちを設定することで対象年月の１日から末日の配列を生成する。
    const count = [...Array(lastDayOfMonth)]
      .map((_, i) => {
        const date = new Date(targetYear, targetMonth - 1, i + 1);
        return date;
      })
      .filter((date) => isWeekEnd(date)).length;

    return count;
  }
}

class Dates {
  #dates: Date[];
  constructor(dates: Date[]) {
    this.#dates = dates;
  }

  get length() {
    return this.#dates.length;
  }

  getWeekendCount() {
    const count = this.#dates.filter((date) => isWeekEnd(date)).length;
    return count;
  }
}

/**
 * 対象年月の祝日一覧を取得する。
 * @param targetYearMonth
 * @returns
 */
const fetchPublicHolidays = async (targetYearMonth: YearMonth): Promise<Dates> => {
  const targetYear = targetYearMonth.getYear();
  // APIから対象年の日本の祝日一覧を取得する。
  const url = `https://date.nager.at/api/v3/publicholidays/${targetYear}/JP`;
  const response = await fetch(url);
  const result = (await response.json()) as { date: string }[];

  const publicHolidays = result
    .map((value) => {
      const date = parse(value.date, "yyyy-MM-dd");
      return date;
    })
    .filter((date) => {
      const targetMonth = targetYearMonth.getMonth();
      const month = date.getMonth() + 1;
      return month == targetMonth;
    });
  return new Dates(publicHolidays);
};

/**
 * yyyyMMの文字列をパースして当月1日を返す。
 * @param inputYearMonth
 * @returns
 */
const parseYearMonth = (inputYearMonth: string): YearMonth => {
  const parsedDate = parse(`${inputYearMonth}01`, "yyyyMMdd");
  const targetYear = parsedDate.getFullYear();
  const targetMonth = (parsedDate.getMonth() + 1) as Month;
  return new YearMonth(targetYear, targetMonth);
};

/**
 * 週末か否か
 * @param date
 * @returns
 */
const isWeekEnd = (date: Date): boolean => {
  return [0, 6].includes(date.getDay());
};

if (import.meta.main) {
  await main(Deno.args);
}
