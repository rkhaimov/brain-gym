# Two Kinds of Systems

* Operational systems consist of backend services where data is created, updated or deleted, for example by serving to
  external users.
* Analytical systems contain readonly copy of the data from the operational systems and optimized for the types of data
  processing that are needed for analytics.

# OLAP vs OLTP

**OLTP** - online transaction processing. Basically it is just CRUD API backed with some persistent storage.
**OLAP** - online analytical processing.

| Property            | Operational systems (OLTP)                      | Analytical systems (OLAP)                 |
|---------------------|-------------------------------------------------|-------------------------------------------|
| Main read pattern   | Point queries (fetch individual records by key) | Aggregate over large number of records    |
| Main write pattern  | Create, update, and delete individual records   | Bulk import (ETL) or event stream         |
| Human user example  | End user of web/mobile application              | Internal analyst, for decision support    |
| Machine use example | Checking if an action is authorized             | Detecting fraud/abuse patterns            |
| Type of queries     | Fixed, predefined by application                | Arbitrary, ad-hoc exploration by analysts |
| Query volume        | Lots of small queries                           | Few queries, each is complex              |
| Data represents     | Latest state of data (current point in time)    | History of events that happened over time |
| Dataset size        | Gigabytes to terabytes                          | Terabytes to petabytes                    |

## Why not use OLTP for analytics

OLTP rarely used for analytics queries. There are several reasons for that:
* The data of interest may be spread across multiple places, making it difficult to combine in a single query.
* The kinds of schemas and data layouts that are good for OLTP are less suited for analytics.
* Analytical queries are expensive and may affect real user experience.

## Data Warehouse

Contains a read-only copy of the data from all the various OLTP systems in the company:
* Data is *extracted* from OLTP databases (using either a periodic data dump or a continuous stream of updates)
* *transformed* into an analysis-friendly schema, cleaned up
* and then *loaded* into the data warehouse

**ETL** - Extracted. Transform. Load.
**ELT** - Extract, Load, Transform. The transformation is done in the data warehouse, after loading.
**CRM** - Customer Relationship Management. A system for managing interactions with customers and prospects.
**ERP** - Enterprise Resource Planning. A system that manages internal business operations.

## Data Lake

Data Warehouse often uses relational model that is queried through SQL. This model works well for the types of queries
that business analysts need to make, but it is less well suited to the needs of data scientists performing tasks such as
these:
* Transforming data into a form that is suitable for training an ML model.
* Using natural language processing (NLP) techniques on multidimensional data.

The answer is a data lake: a centralized data repository that holds a copy of any data that might be useful for
analysis, obtained from operational systems via ETL processes.

> The difference from a data warehouse is that a data lake simply contains files, without imposing any particular file
> format, data model, or schema.

# Single-Node vs Distributed

## Distributed System 

Is a system where two or more processes (aka nodes) communicate with each other via network (is it always a network or any IPC would suffice?).

Pros:
* Inter cloud services - when data is stored in one service but processed in another.
* Fault tolerance/high availability - you can use multiple machines to give you redundancy so that one machine can
replace failed one.
* Scalability - when data volume or computing requirements increase, load can spread across multiple instances.
* Latency - placing nodes closer to a user
* Elasticity - it is easier to adapt to demand when using cloud services for example than on a single machine.
* Modularity - each service can be updated independently, reducing coordination effort among teams (partially true)
* Extensibility - service's internals are hidden behind public API interface
* Scoped DB. Not a cone in traditional sense, but sharing DB would make it a part of public API and thus it will be
  harder to change. Also, via shared DB one service can impact another via direct queries which may be harder to
  observe. 

Cons:
* Network is fragile by itself. Even when request is failed, it is unknown whether request was received by a service.
* Network call is slower than calling a function withing same process.
* Troubleshooting a distributed system is often difficult—if the system is slow to respond, how do you figure out where
  the problem lies
* When each service has its own database, maintaining consistency of data across those different services becomes the
  application’s problem
* Service testing is harder due to complex env setup
* Each service requires infrastructure for deploying new releases, adjusting the allocated hardware resources to match
  the load, collecting logs, monitoring service health, and alerting an on-call engineer in the case of a problem (kinds
  of things k8s does).
* Backward compatibility is also a concern when updating services

## Single Node

Single machine systems is much simpler in regards highlighted before. CPUs, memory, and disks have grown larger, faster,
and more reliable. Many workloads can now run on a single node.

# Non-functional Requirements

These include:
* Consistency
* Reliability (Availability)
* Performance
* Security
* Scalability
* Maintainability
* Observability
* Modularity
* Evolvability

## Case Study: Social Network Home Timelines

### Describing load

* Users make a total of 500 million posts per day (or 5_800 posts per second)
* Spike may occur as high as 150_000 posts per second
* Average user follows 200 people and has 200 followers
* Newly created posts must be observable by followers withing 5 seconds after publishing

### ADR

Long polling is a simple technique: stateless http request is done every 5 seconds to fetch fresh timeline. Errors,
retries and scalability is handled easily. But, assuming there are 10 millions users online on average -> ~2 millions
requests per second -> ~400 millions DB requests - that's huge.

#### Materialization

**Materialization** - is the process of precomputing and updating the results of a query.

Other approach is to use **derived data** approach where for each user data structure is stored, containing their home
timeline (the recent posts by people they are following). This ds must be updated every time followee add, modify or
delete posts.

To receive notifications of new posts added, user simply can subscribe to a stream of posts being added to home
timeline.

Given average of 5_800 posts per second and 200 followers -> 1 million home timeline writes per second which is a lot,
but significantly less that 400 million queries.

When rate of posts will spike, we do not have to do delivers immediately, we can simply queue them and accept that it
will temporarily take a bit longer for posts to show up in followers timeline.

## Describing Performance

When talking about web service performance, consider two main types of metric:
**Response time** - the time between a client makes a request until requested answer is received.
**Throughput** - the number of requests per second or data volume per second that the system is processing.

> As the throughput of a service approaches its capacity, the response time increases dramatically because of queueing

### Percentiles

Is a main way of describing target values for response time. Averages for example respect very little to outliers which
may be important in a lot of cases. p95, p99, p99.9 and etc.

They are often used in service level objectives (SLOs) and service level agreements (SLAs) as ways of defining the
expected performance and availability of a service.

### Example

SLO may set a target for a service to have a median response time of less than 200 ms and a 99th percentile under 1
second, and a target that at least 99.9% of valid requests result in non-error responses. An SLA is a contract that
specifies what happens if the SLO is not met (e.g., customers may be entitled to a refund).

## Describing Reliability

System is fault-tolerant when it continues to respect SLO in spite of certain faults occurring.

> Fault injection - is a process when certain parts of system are failing randomly. By deliberately inducing faults, you
> ensure that the fault-tolerance machinery is continually exercised and tested, which can increase your confidence that
> faults will be handled correctly when they occur naturally

### Redundancy against hardware faults

* Disks may be set up in a RAID configuration (spreading data across multiple disks in the same machine so that a failed
  disk does not cause data loss)
* servers may have dual power supplies
* hot-swappable CPUs
* datacenters may have batteries and diesel generators for backup power


### Software faults has no quick solutions

The problem of systematic faults in software has no quick solution. Lots of small things can help:
* carefully thinking about assumptions and interactions in the system;
* thorough testing;
* ensuring process isolation;
* allowing processes to crash and restart;
* avoiding feedback loops such as retry storms;
* measuring;
* monitoring;
* and analyzing system behavior in production.

### Human error

Various technical measures can help minimize the impact of human mistakes:
* thorough testing (both handwritten tests and property testing on lots of random inputs)
* rollback mechanisms for quickly reverting configuration changes
* gradual rollouts of new code
* detailed and clear monitoring
* observability tools for diagnosing production issues
* well-designed interfaces that encourage “the right thing” and discourage “the wrong thing.

## Describing Scalability

Discussing scalability means considering questions like these:
* If the system grows in a particular way, what are our options for coping with the growth?
* How can we add computing resources to handle the additional load?
* Based on current growth projections, when will we hit the limits of our current architecture?

Load is measured as:
* Number of requests per second
* Number of gigabytes per second
* Number of shopping cart checkouts per hour
* Read/Write ratio in DB
* Cache hit rate
* Number of data items per user

When you increase the load in a certain way:
* And keep the system resources (CPUs, memory, network bandwidth, etc.) unchanged, how is the performance of your system
  affected?
* How much do you need to increase the resources if you want to keep performance unchanged?

> The goal is to keep the performance of the system within the requirements of the SLA while being cost effective

### Principles for Scalability

* A good general principle for scalability is to break a system into smaller components that can operate largely
  independently of one another.
* Another good principle is not to make things more complicated than necessary. If a single-machine database will do the
  job, it’s probably preferable to a complicated distributed setup.

> A system with 5 services is simpler than one with 50. Good architectures usually involve a pragmatic mixture of
> approaches.

## Describing Maintainability

> It is widely recognized that the majority of the cost of software is not in its initial development but in its ongoing
> maintenance—fixing bugs, keeping its systems operational, investigating failures, adapting it to new platforms,
> modifying it for new use cases, repaying technical debt, and adding new features

Pay attention to several principles that are widely applicable:
* Operability - Make it easy for the organization to keep the system running smoothly.
* Simplicity - Make it easy for new engineers to understand the system, by implementing it using well-understood,
  consistent patterns and structures and avoiding unnecessary complexity
* Evolvability - Make it easy for engineers to make changes to the system in the future, adapting it and extending it
  for unanticipated use cases as requirements change.

# Relational vs Document Models

Relational DB's require describing the model via relational structure which may conflict with how behaviour may be
represented inside OOP language. For that, ORM is used. It acts as translation layer, helping to join two related
layers.

Imagine storing CV profile inside document oriented DB:

```json5
{
  "user_id": 251,
  "first_name": "Barack",
  "last_name": "Obama",
  "photo_url": "/p/7/000/253/05b/308dd6e.jpg",
  "positions": [
    {
      "job_title": "President",
      "organization": "United States of America"
    },
    {
      "job_title": "US Senator (D-IL)",
      "organization": "United States Senate"
    }
  ],
  // ...
}
```

For relational:
Props:
* Data is normalized (which speeds up writes but slows down reads)

Cons?:
* Impedance mismatch between the application code and the storage layer
* You need to perform multiple queries

For document oriented:

Pros:
* JSON model reduces the impedance mismatch between the application code and the storage layer
* The lack of a schema is often cited as an advantage too (improves flexibility)
* The JSON representation has better locality than the multi-table schema
* JSON representation makes tree structure explicit
* There aren't many relations inside CV (one-to-few)

Cons?:
* There are also problems with JSON as a data encoding format (why?)
* Data is denormalized (which slows down writes but speeds up reads)

* normalization tends to be better for OLTP systems, where both reads (via materialization?) and updates need to be fast;
* analytical systems often fare better with denormalized data, since they perform updates in bulk and the performance of
  read-only queries is the dominant concern.
* in systems of small to moderate scale, a normalized data model is often best because you don’t have to worry about
  keeping multiple copies of the data consistent with one another, and the cost of performing joins is acceptable
* however, in very large-scale systems, the cost of joins can become problematic.

> Normalization and denormalization are not inherently good or bad—they simply represent trade-offs in terms of
> performance of reads and writes and implementation effort.

### OLAP models

For analytics three primary schemes are popular:
* Star schema - where one facts table references others dims table. One row in facts table represents an event
* Snowflake schema - it is much more normalized form of star schema. Dimensions are broken into sub dimensions
* OBT (one big table) - denormalized form where facts table includes raw information about an event. Not a big problem
  for OLAP since they are inherently read heavy and historical data is immutable (in general)

### When to use which

**Document model**:
* Schema flexibility
* Better performance due to locality
* Closer to object model used by the application

**Relational model**:
* Better support for joins
* Better support for many-to-one and many-to-many relationships

#### Document like structure

Tree of one-to-many relationships, where typically the entire tree is loaded at once, then it’s probably a good idea to
use a document model.

#### Referencing internal item

You cannot refer directly to a nested item within a document. If you need to reference nested items, a relational
approach works better, since you can refer to any item directly by its ID.

#### Ordering items

The document model supports such applications well, because the items (or their IDs) can simply be stored in a JSON
array to determine their order. In relational databases there isn’t a standard way of representing such reorderable
lists, and various tricks are used, such as sorting by an integer column.

#### Data locality for reads and writes

Document is stored as single contiguous string. If your application often needs to access the entire document (e.g., to
render it on a web page), this storage locality has a performance advantage. If data is split across multiple tables,
more disks seeks will be required.

When only small parts of document are needed, retrieving whole document may be wasteful. The same argument applies when
updating entities. Thus, it is recommended to keep documents fairly small and avoid frequent small updates.

> It is important to note that storing related data together for locality is not limited to the document model

---
> If your application has mostly one-to-many relationships (treestructured data) and few other relationships between
> records, the document model is appropriate.
---

# Event Sourcing and CQRS

In complex applications it can sometimes be difficult to find a single data representation that is able to satisfy all
the ways that the data needs to be queried and presented. In such situations, it can be beneficial to write data in one
form and then derive from it representations that are optimized for different types of reads.

Perhaps the simplest, fastest, and most expressive way of writing data is an event log: every time you want to write
some data, you encode it as a self-contained string and then append it to a sequence of events.

> The principle of maintaining separate read-optimized representations and deriving them from the write-optimized
> representation is called command query responsibility segregation (CQRS)

Event sourcing and CQRS have several advantages:
* For the people developing the system, events better communicate the intent of why something happened
* A key principle of event sourcing is that the materialized views are derived from the event log in a reproducible way
* You can have multiple materialized views that are optimized for the particular queries that your application requires
* If you decide you want to present the existing information in a new way, building a new materialized view from the
  existing event log is easy
* If an event was written in error, you can write a subsequent deletion event to reverse it
* The event log can also serve as an audit log of what has occurred in the system, which is valuable in regulated
  industries that require such auditability
* Event logs can typically handle higher write throughput than databases because of their sequential access patterns

However, event sourcing and CQRS also have downsides:
* You need to be careful if external information is involved
* The requirement that events are immutable creates problems if events contain personal data from users, since users may
  exercise their right (e.g., under the GDPR) to request deletion of their data
* Reprocessing events requires care if there are externally visible side effects—for example, you probably don’t want to
  resend confirmation emails every time you rebuild a materialized view
* About large amount of events?

Final comparison:
* The relational model, despite being more than half a century old, remains an important data model for many
  applications—especially in data warehousing and business analytics, where relational star or snowflake schemas and SQL
  queries are ubiquitous
* The document model targets use cases where data comes in self-contained JSON documents and where relationships between
  one document and another are rare.
* Graph data models go in the opposite direction, targeting use cases where anything is potentially related to
  everything and where queries potentially need to traverse multiple hops to find the data of interest
* DataFrames generalize relational data to large numbers of columns, providing a bridge between databases and the
  multidimensional arrays that form the basis of much machine learning, statistical data analysis, and scientific
  computing
  

# Storage and Retrieval

## Log structured storage

Simple log structured (append only on writes) storage with hash table index maintained in RAM.
Pros:
* Fast writes
* Simple impl
* Fast lookups on given ids

Cons:
* No compaction (disk space may fill quickly)
* Hash table index inside temp memory and must be recalculated on restarts
* Range queries are not efficient

## Sorted Strings Table (SStable)

An SSTable typically contains:

* **Data blocks** — sorted key-value pairs grouped into fixed/variable-sized blocks.
* **Sparse index** — maps key ranges (often the first key in each block) to block locations on disk.
* **Bloom filter** — built from the keys, allows fast "definitely not present" checks.
* **Metadata/footer** — offsets, statistics, compression info, checksums, etc.

It allows for fast reads (relative to other I/O operations)

> Writes are not possible since SSTable is immutable

## LSM-Tree

* **WAL append** — every write is first appended to the Write-Ahead Log for durability.
* **MemTable update** — data is inserted into an in-memory sorted structure (typically a skip list), giving `O(log n)`
  reads/writes.
* **MemTable flush** — when the MemTable reaches a size threshold, it is frozen and written to disk as a new immutable
  SSTable.
* **Read path** — reads check MemTable first, then SSTables (using Bloom filters and sparse indexes to avoid unnecessary
  disk reads).
* **Delete path** — deletes are recorded as tombstones rather than immediately removing data.
* **Compaction** — background process merges SSTables, keeps the newest version of each key, removes obsolete versions,
  and eventually removes tombstones.
* **Result** — random writes become mostly sequential disk writes, trading higher write throughput for more complex
  reads and background compaction work.

### Size-Tiered Compaction (STCS)

When several SSTables of similar size accumulate, merge them into a larger SSTable.

Pros:
* Low write amplification.
* Good for write-heavy workloads.

Cons:
* Many SSTables can exist simultaneously.
* Reads may need to check many SSTables.

### Leveled Compaction (LCS)

L0: 4 SSTables
↓
L1: 10 MB
↓
L2: 100 MB
↓
L3: 1 GB

Each level is ~10× larger than the previous one.

Key property:

* L1+ SSTables do not overlap in key ranges.
* Only L0 may overlap.

Pros:
* Excellent read performance.

Cons:
* Higher write amplification due to frequent rewrites.

## B-Trees

Is a storage mechanism that stores key-value pairs in sorted way and splits data in a fixed sized pages (usually 4 Kb).
Each page contain references to children pages (configurable via branching factor).

* **Reads** are efficient O(log(n)) since B-Tree is balanced (for n values tree height is log(n))
* **Writes** are also mostly efficient. Modifications are in place (so pages are mutable). When adding new values, pages
  can be split if size is exceeded and parent must be updated. Deletions are less efficient.

### Reliability

Splitting pages is a dangerous operation since tree may be corrupted if process crashes midterm. Also, if OS FS does not
guarantee atomicity - page itself may be corrupted. To protect against such situations, WAL is used.

To improve performance, B-tree implementations typically don’t immediately write every modified page to disk, but buffer
the B-tree pages in memory for a while first. The write-ahead log then also ensures that data is not lost in the case of
a crash.

> Copy-on-write scheme - A modified page is written to a different location, and a new version of the parent pages in
> the tree is created, pointing at the new location. This approach is also useful for concurrency control

## LSM-Tree vs B-Tree

As a rule of thumb, LSM-trees are better suited for write-heavy applications, whereas B-trees are faster for reads.

### Performance Comparison

#### Point lookup

B-Tree requires checking each page on the path to find point record, since total number is small, point lookup is
usually fast. LSM-Tree requires scanning several SSTables at diff stages of compaction. Bloom filters help to reduce
impact. Both can perform well, it mostly depends on concrete storage engine and workload.

#### Range queries

B-Tree allows to quickly retrieve records in range since keys are sorted inside pages. LSM-Tree requires scanning over
all segments (MemTable, recent SSTable and persistent tables) in parallel.

> High write throughput can cause latency spikes for read and write operations inside LSM-Tree when memtable fills-up
> and needs to be flushed to disk. Storage engine may suspend reads and writes in such cases.

#### Writes

B-Tree does random writes (many small operations, possibly scattered on a disk), while LSM-Tree perform large writes (
while flushing memtable and compacting) aka sequential writes. Disks generally have higher sequential write throughput
than random write throughput.

> If you take number of bytes written on a disk after workload and divide it to a number of bytes of workload itself ->
> you would get *write amplification*.

The higher the write amplification, the fewer writes per second it can handle within the available disk bandwidth.

## Multicolumn and Secondary Indexes

There are three types of index-to-value relations:
* Clustered index - when index stores referenced data in-place. It improves read performance but slows down writes due
  to duplication and requires more disk space.
* Heap file based index - when index stores references to data. Data itself stored inside heap files. Provides better
  write throughput.
* Covering index - when index stores part of data (some of the columns). This is middle ground between clustered index. 

## Data Warehouses

Following components can be defined:
* Query engine - parse SQL queries, optimize them into execution plans, and execute them against the data.
* Storage format - determines how the rows of a table are encoded as bytes in a file.
* Table format - used to support row inserts and deletions. Specifies a file format that defines which files constitute
  a table along with the table’s schema.
* Data catalog - just as a table format defines which files make up a table, a data catalog defines which tables are
  contained in a database.

### Column-Oriented Storage

Stores data in column oriented format, thus allowing for faster analytical queries (i.e. which select only certain
number of columns over large number of rows).

Typical implementations store values in a separate files. For example each file covering constant time range, thus
making date range queries fast.

> Bitmaps are used to represent repetitive values efficiently

It also makes sense to sort columns:
* Sort key can be set to be timestamp of an event which will allow to optimize queries targeting last month events
* Second sort key can target product_sk column (events with the same timestamp will be sorted by product_sk) so that
  query targeting last month events for a certain product will be faster
* Sorting will also help with column compression (using bitmaps and RLE), because duplicate keys will appear next to
  each other

> Column-oriented storage, compression, and sorting all help to make those read queries faster

For writes, it is common for columnar storage to use batch writes instead of single row inserts:
* Write affects multiple column files (Column A, Column B, etc.)
* Files must be decompressed before modification
* Columns must be shifted (to maintain sort)
* Files must be recompressed after modification

When writing data in batches, all this steps must be done just once, thus distributing the cost.

# Estimating Load

## Estimate active users

How many users are active simultaneously?
1,000,000 DAU. 10% active during peak hour

Then:
```text
100,000 users during peak hour.
```

## Estimate user actions

Example assumptions:
100,000 active users 1 action every 30 sec

Then:
```text
100,000 / 30 ≈ 3,333 actions/sec
```

## Expand actions into backend operations

One user action may trigger: 1 write and 10 reads

Then:
```text
Writes count = 0,303/sec
Reads count = 3,030/sec
```

## Estimate network throughput

Suppose: Read response = 10 KB, Write request = 1 KB

Then:
```text
Read throughput: 10 * 3,030 = 30,303 KB/sec
Write throughput: 1 * 0,303 =  0,303 KB/sec
```

## Estimate storage growth

Then:
```text
3,303 KB/sec

~25.5 MB/day
~765 MB/month
```

For read heavy system seek for:

* read latency;
* cache hit ratio;
* query/index design;
* replicas/read scaling;
* avoiding unnecessary DB reads;
* denormalization/materialized views if needed.

For write heavy system seek for:

* Write throughput (writes/sec).
* Write latency (especially p95/p99).
* Sustained ingestion rate.
* Disk I/O efficiency.
* WAL and durability strategy.
* Partitioning/sharding strategy.
* Compaction efficiency (for LSM).
* Backpressure handling.
* Storage growth rate.

# Misc

## Vocabulary

**Transaction** - is a group of reads and writes that form a logical unit.
**Systems of record** - essential true state. Facts are represented exactly once (normalized).
**Derived data systems** - data derived from true state. Is a form of redundancy.

## Operational Aspects

* Capacity planning - disk memory space, CPU, RAM
* Performance - response time, latency
* Security - app and 3rd parties
* Load monitoring - tracking performance degradations causes and outages
* Fault tolerance/high availability
* Scalability

## Stack

MySQL, PostgreSQL, MongoDB - Operational/OLTP
Teradata, ClickHouse, Spark - Analytical/OLAP
OpenTelemetry, Zipkin, Jaeger - Tracing tools
DuckDB, SQLite, and KùzuDB - single node DB
