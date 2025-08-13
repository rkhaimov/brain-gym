module Main where

data UserBase = UserBase
  { userBaseName :: String
  }

data UnauthorizedUser = UnauthorizedUser
  { unauthorizedUserGuestID :: Int,
    unauthorizedUserBase :: UserBase
  }

data AuthorizedUser = AuthorizedUser
  { authorizedUserEmail :: String,
    authorizedUserBase :: UserBase
  }

data User = Unauthorized UnauthorizedUser | Authorized AuthorizedUser

-- cabal build lib:brain-gym
-- cabal build exe:brain-gym
-- cabal exec brain-gym
-- cabal run brain-gym
main :: IO ()
main = undefined
