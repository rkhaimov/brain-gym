module Main (main) where

import Text.Read (Lexeme (Char, String), readMaybe)

type AppValue = Either String

-- 173 page
-- runghc -Wincomplete-patterns main.hs
-- https://github.com/BartoszMilewski/DaoFP/blob/master/DaoFP.pdf
main = print $ show $ eval "* 2 - 12 4"
