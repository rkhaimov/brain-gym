module Utils (Name, createName) where

-- Представляет не пустую строку
data Name = Name
  { value :: String
  }

createName :: String -> Maybe Name
createName "" = Nothing
createName str = Just $ Name str

