module Main (main) where

import Text.Read (Lexeme (Char, String), readMaybe)

data Operation = Add | Sub | Mul

apply :: Operation -> (Int -> Int -> Int)
apply operation =
  case operation of
    Add -> (+)
    Sub -> (-)
    Mul -> (*)

data Expression = Expression
  { initial :: Int,
    others :: [(Operation, Int)]
  }

toInt :: Expression -> Int
toInt expression =
  foldr calc (initial expression) (others expression)
  where
    calc :: (Operation, Int) -> Int -> Int
    calc (operation, right) left = apply operation left right

zero :: Expression
zero =
  Expression
    { initial = 0,
      others = []
    }

eval :: String -> Maybe Int
eval = fmap toInt . fromString
  where
    fromString :: String -> Maybe Expression
    fromString expression =
      let parts = words expression
          minitial = createInitial parts
          mothers = createOthers (take (length parts - 1) parts)
       in createExpression minitial mothers
    createInitial :: [String] -> Maybe Int
    createInitial [] = Nothing
    createInitial parts = parseInt $ last parts
    createOthers :: [String] -> Maybe [(Operation, Int)]
    createOthers [] = Just []
    createOthers (operation : coef : tail) =
      case createOthers tail of
        Nothing -> Nothing
        (Just others) -> fmap (: others) (createOperationInt (parseOperation operation) (parseInt coef) :: Maybe (Operation, Int))
    createOthers _ = Nothing
    createOperationInt :: Maybe Operation -> Maybe Int -> Maybe (Operation, Int)
    createOperationInt Nothing _ = Nothing
    createOperationInt _ Nothing = Nothing
    createOperationInt (Just operation) (Just int) = Just (operation, int)
    parseOperation :: String -> Maybe Operation
    parseOperation char = case char of
      "+" -> Just Add
      "-" -> Just Sub
      "*" -> Just Mul
      _ -> Nothing
    createExpression :: Maybe Int -> Maybe [(Operation, Int)] -> Maybe Expression
    createExpression Nothing _ = Nothing
    createExpression _ Nothing = Nothing
    createExpression (Just initial) (Just others) = Just Expression {initial = initial, others = others}
    parseInt :: String -> Maybe Int
    parseInt = readMaybe

-- 160 page
-- runghc -Wincomplete-patterns main.hs
-- https://github.com/BartoszMilewski/DaoFP/blob/master/DaoFP.pdf
main = print $ show $ eval "* 3 - 2 + 10 + 1 0"
