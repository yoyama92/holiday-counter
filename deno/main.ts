import { parse } from "https://deno.land/std@0.192.0/datetime/mod.ts";

/**
 * 対象年月の祝日一覧を取得する。
 * @param targetYear
 * @param targetMonth
 * @returns
 */
export const fetchPublicHolidays = async (targetYear: number, targetMonth: number): Promise<Date[]> => {
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
      const month = date.getMonth() + 1;
      return month === targetMonth;
    });
  return publicHolidays;
};

/**
 * yyyyMMの文字列をパースして当月1日を返す。
 * @param inputYearMonth
 * @returns
 */
export const parseYearMonth = (inputYearMonth: string): Date => {
  const parsedDate = parse(`${inputYearMonth}01`, "yyyyMMdd");
  return parsedDate;
};

/**
 * 対象年月の１日から末日までの配列を生成する。
 * @param targetYear
 * @param targetMonth
 * @returns
 */
export const generateTargetMonthDays = (targetYear: number, targetMonth: number): Date[] => {
  const lastDayOfMonth = new Date(targetYear, targetMonth, 0, 0).getDate();

  // 日数分の配列を作成して、配列のインデックスから日にちを設定することで対象年月の１日から末日の配列を生成する。
  const targetDays = [...Array(lastDayOfMonth)].map((_, i) => {
    const day = new Date(targetYear, targetMonth - 1, i + 1);
    return day;
  });
  return targetDays;
};

/**
 * 配列に含まれる週末の日数を数える。
 * @param days
 * @returns
 */
export const countWeekend = (days: Date[]): number => {
  const count = days.filter((date) => [0, 6].includes(date.getDay())).length;
  return count;
};

const args = Deno.args;

// 入力をパース
const targetYearMonth = parseYearMonth(args[0]);
const targetYear = targetYearMonth.getFullYear();
const targetMonth = targetYearMonth.getMonth() + 1;

const targetDays = generateTargetMonthDays(targetYear, targetMonth);
const publicHolidays = await fetchPublicHolidays(targetYear, targetMonth);

// 週末＋祝日から休日数を求める。週末と被った祝日は２重カウントになっているので調整する。
const count = countWeekend(targetDays) + publicHolidays.length - countWeekend(publicHolidays);

console.log(count);
