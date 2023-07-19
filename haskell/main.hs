import Data.Time.Calendar (fromGregorian, gregorianMonthLength, toGregorian)
import Data.Time.Calendar.OrdinalDate
import Data.Time.Format (defaultTimeLocale, parseTimeM)
import System.Environment (getArgs)

isWeekEnd :: Day -> Bool
isWeekEnd date
  | dayOfWeek == 6 = True
  | dayOfWeek == 7 = True
  | otherwise = False
  where
    (_, dayOfWeek) = mondayStartWeek date

parseYearMonth :: String -> Maybe Day
parseYearMonth inputYearMonth = parseTimeM True defaultTimeLocale "%Y%m" inputYearMonth :: Maybe Day

generateTargetMonthDays :: Integer -> Int -> [Day]
generateTargetMonthDays targetYear targetMonth = [generateDay dayOfMonth | dayOfMonth <- daysOfMonth]
  where
    generateDay = fromGregorian targetYear targetMonth
    monthLength = gregorianMonthLength targetYear targetMonth
    daysOfMonth = [1 .. monthLength]

countWeekend :: [Day] -> Int
countWeekend dates = length [date | date <- dates, isWeekEnd date]

countTargetMonthHoliday :: Maybe Day -> Int
countTargetMonthHoliday Nothing = 0
countTargetMonthHoliday (Just targetYearMonth) = countWeekend (generateTargetMonthDays targetYear targetMonth)
  where
    (targetYear, targetMonth, _) = toGregorian targetYearMonth

main :: IO ()
main = do
  args <- getArgs
  print $ countTargetMonthHoliday (parseYearMonth (head args))
