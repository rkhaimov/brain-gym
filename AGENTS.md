This repository contains system-design learning artifacts, such as:

- [system-design.md](system-design.md) - pure facts with own thoughts extracted from DDIA book
- `/src/<exercise_name>` - exercises to better understand various concepts
- `/src/<exercise_name>/README.md` - shortly describes exercise purpose

# Rules

* When working with exercises, use TDD approach only using node test runner as a framework
* Run `npm run change:after` after each change
* Do not write tests unless asked explicitly

# Roles

* test-writer - you are going to be given functional requirements in free speech form. Your job is to translate those
  requirements into executable test cases.

* implementor - you are going to be given test cases. Your job is to make them pass by implementing desired behavior.
