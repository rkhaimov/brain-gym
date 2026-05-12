```text
Kafka updates
→ version registry
→ versioned cache keys
→ L1 memory LRU
→ L2 filesystem cache
→ upstream tile sources
→ sharp composite
→ cache source tiles + composite tiles
```


```text
Kafka:
  сообщает, что pyramidId получил новую version

Version Registry:
  хранит current version каждой пирамиды

L1 LRU:
  быстрый hot cache внутри процесса

L2 FS:
  большой локальный cache тайлов и склеек

Cleanup job:
  удаляет старые/лишние файлы по TTL и max-size

Tile Composer:
  строит versioned cache keys,
  достаёт source tiles,
  склеивает,
  кеширует,
  отдаёт OpenLayers один PNG
```

И потенциальная архитектура для мульти-инстансов

```mermaid
flowchart TD
  OL[OpenLayers] --> LB[Load Balancer]
  LB --> API1[Tile Composer 1]
  LB --> API2[Tile Composer 2]
  LB --> API3[Tile Composer N]

  API1 --> L1A[L1 LRU]
  API2 --> L1B[L1 LRU]
  API3 --> L1C[L1 LRU]

  API1 --> S3[MinIO]
  API2 --> S3
  API3 --> S3

  API1 --> Redis[Redis]
  API2 --> Redis
  API3 --> Redis

  Kafka[Kafka pyramid-updates] --> API1
  Kafka --> API2
  Kafka --> API3

  Redis --> Registry[Version Registry]
  Redis --> Locks[Distributed Locks]
```
