# Screentimer
An ES6 class, jQuery-free version of [robflaherty/screentime](https://github.com/nytpi/robflaherty/screentime).

## Usage
```js
import Screentimer from 'screentimer';

const element = document.querySelector('#my-element');

// Setup
const timer = new Screentimer(element, count => {
  console.log(`Seen #my-element on-screen for ${count} intervals since the last report.`);
});

// Optional event handler cleanup
timer.destroy();
```
