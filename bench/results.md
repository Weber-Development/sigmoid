30 elements, 150 scroll steps, median of 5 runs:

| Library | Size (min+gzip) | JavaScript | Main-thread tasks | Style recalc |
|---|---|---|---|---|
| No library | 0.0 kB | 1.5 ms | 70.6 ms | 0 ms |
| Sigmoid (CSS only) | 0.0 kB | 1.4 ms | 155.8 ms | 32.8 ms |
| Sigmoid (native) | 2.3 kB | 1.3 ms | 142.2 ms | 30.7 ms |
| Sigmoid (fallback) | 2.3 kB | 27.2 ms | 143.2 ms | 34.6 ms |
| GSAP ScrollTrigger | 45.3 kB | 39.2 ms | 154 ms | 18.7 ms |
| Motion | 22.9 kB | 113.9 ms | 247 ms | 24.7 ms |
| AOS (fires once) | 5.4 kB | 8.1 ms | 77.1 ms | 0 ms |

300 elements, 150 scroll steps, median of 5 runs:

| Library | Size (min+gzip) | JavaScript | Main-thread tasks | Style recalc |
|---|---|---|---|---|
| No library | 0.0 kB | 1.5 ms | 96.8 ms | 0 ms |
| Sigmoid (CSS only) | 0.0 kB | 0.8 ms | 709.8 ms | 104.9 ms |
| Sigmoid (native) | 2.3 kB | 0.9 ms | 972 ms | 131.9 ms |
| Sigmoid (fallback) | 2.3 kB | 74.4 ms | 444 ms | 158.1 ms |
| GSAP ScrollTrigger | 45.3 kB | 61.2 ms | 376 ms | 74.2 ms |
| Motion | 22.9 kB | 731.1 ms | 1049.4 ms | 66 ms |
| AOS (fires once) | 5.4 kB | 16.8 ms | 114.6 ms | 0 ms |
