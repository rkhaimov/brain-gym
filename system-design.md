# Metrics

When talking about decision strategies, one must consider using specific metrics to measure effectivness of different
solutions, to simply pick the best suited approach.

## Reliability

* The application performs the function that the user expected
* It can tolerate the user making mistakes or using the software in unexpected ways
* Its performance is good enough for the required use case, under the expected load and data volume
* The system prevents any unauthorized access and abuse

## Scalability

Discussing scalability means considering questions like "If the system grows in a particular way, what are our options
for coping with the growth" and "How can we add computing resources to handle the additional load"

What is performance in terms of a web app? How it can be measured?

An architecture that scales well for a particular application is built around assumptions of which operations will be
common and which will be rare - the load parameters.

In an early-stage startup or an unproven product its usually more important to be able to iterate quickly on product
features than it is to scale to some hypothetical future load.

## Maintainability

It is well known that the majority of the cost of software is not in its initial development, but in its ongoing
maintenance.

* Simplicity
* Evolvability (extensibility, adaptability)
* Operability (traces, restore, updates, deployment)