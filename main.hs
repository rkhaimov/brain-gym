module Main (main) where

data CustomerInfo = CustomerInfo
  { customerName :: String,
    customerBalance :: Int
  }

data EmployeeInfo = EmployeeInfo
  { employeeName :: String,
    employeeManagerName :: String,
    employeeSalary :: Int
  }

data Person
  = Customer CustomerInfo
  | Employee EmployeeInfo

george =
  Customer $
    CustomerInfo
      { customerName = "Georgie Bird",
        customerBalance = 100
      }

porter =
  Employee $
    EmployeeInfo
      { employeeName = "Porter P. Pupper",
        employeeManagerName = "Remi",
        employeeSalary = 10
      }

getPersonName :: Person -> String
getPersonName person =
  case person of
    Employee employee -> employeeName employee
    Customer customer -> customerName customer

getManagerName :: Person -> String
getManagerName = employeeManagerName . adapt
  where
    adapt :: Person -> EmployeeInfo
    adapt person = case person of
      Employee employee -> employee
      Customer customer -> undefined

-- Creating Lazy Streams 142 page
-- runghc -Wincomplete-patterns main.hs
-- https://github.com/BartoszMilewski/DaoFP/blob/master/DaoFP.pdf
main = undefined
