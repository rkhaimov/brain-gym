For UI animation → requestAnimationFrame
For delayed work → setTimeout
For repeated work → setInterval or recursive setTimeout
For after-current-stack logic → queueMicrotask / Promise.then
For non-urgent background work → requestIdleCallback
For breaking long work → scheduler.yield()