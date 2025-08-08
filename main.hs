module Main (main) where

import Text.Read (Lexeme (Char, String), readMaybe)

parseInt :: String -> Maybe Int
parseInt = readMaybe

parseOperation :: String -> Maybe (Int -> Int -> Int)
parseOperation char = case char of
  "+" -> Just (+)
  "-" -> Just (-)
  "*" -> Just (*)
  _ -> Nothing

eval :: String -> Maybe Int
eval = eval' . words
  where
    eval' :: [String] -> Maybe Int
    eval' [] = Nothing
    eval' [coef] = parseInt coef
    eval' (operation : coef : others) = calc (parseOperation operation) (parseInt coef) (eval' others)
    calc :: Maybe (Int -> Int -> Int) -> Maybe Int -> Maybe Int -> Maybe Int
    calc Nothing _ _ = Nothing
    calc _ Nothing _ = Nothing
    calc _ _ Nothing = Nothing
    calc (Just f) (Just a) (Just b) = Just (f a b)

-- 160 page
-- runghc -Wincomplete-patterns main.hs
-- https://github.com/BartoszMilewski/DaoFP/blob/master/DaoFP.pdf
main = print $ show $ eval "* 2 - 12 4"
