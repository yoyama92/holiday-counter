import sys
import datetime
import calendar
import requests


def fetch_public_holidays(target_year: int, target_month: int) -> list[datetime.date]:
    """
    対象年月の祝日一覧を取得する。
    """
    url = f'https://date.nager.at/api/v3/publicholidays/{target_year}/JP'
    response = requests.get(url)
    result = response.json()
    public_holidays = [datetime.datetime.strptime(data["date"], "%Y-%m-%d").date() for data in result]
    target_month_public_holidays = [date for date in public_holidays if date.month == target_month]
    return target_month_public_holidays


def parse_year_month(input_year_month: str) -> datetime.date:
    """
    yyyyMMの文字列をパースして当月1日を返す。
    """
    dt = datetime.datetime.strptime(input_year_month, "%Y%m").date()
    return dt


def generate_target_month_days(target_year: int, target_month: int) -> list[datetime.date]:
    """
    対象年月の１日から末日までの配列を生成する。
    """
    # 対象年月の日数を取得する。
    last_day_of_month = calendar.monthrange(target_year, target_month)[1]
    target_days = [datetime.date(target_year, target_month, i) for i in range(1, last_day_of_month + 1)]
    return target_days


def count_weekend(days: list[datetime.date]) -> int:
    """
    配列に含まれる週末の日数を数える。
    """
    count = len([date for date in days if date.weekday() in [5, 6]])
    return count


argv = sys.argv

target_year_month = parse_year_month(argv[1])
target_year = target_year_month.year
target_month = target_year_month.month

target_days = generate_target_month_days(target_year, target_month)
public_holidays = fetch_public_holidays(target_year, target_month)

count = count_weekend(target_days) + len(public_holidays) - count_weekend(public_holidays)
print(count)
