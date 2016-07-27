# gifme

Convert any video file or video readable stream to an animated GIF of desired length and size.

## Features

- Less depedencies
- Fast
- No temporary files generated
- Supports readable stream as input
- Returns promise, better for handling errors

## Requirements

Before using gifme, please install:

- [Node.js](https://nodejs.or)
- [FFmpeg](http://ffmpeg.org/)

## Installation

For global
```shell
npm install -g gifme
```
For local
```shell
npm install gifme
```

## Usage

```js
let fs = require('fs');
let gifme = require('gifme');
let path = require('path');

let input = path.join(__dirname, 'video.mp4');
let output = path.join(__dirname, 'video.gif');

let gif = fs.createWriteStream(output);

var options = {
  width: 320,
  height: 240,
  from: '00:00:00.000',
  to: '00:00:10.000'
};

gifime(input, options)
  .then((gifStream) => {
    gifStream.pipe(output);
  })
  .catch(err, function doSomthingWithError(error){//do something});
```

You can also pass a readable stream to `gifme(stream, options)`.

## Options usage

options can have following keys

* `from` - from speciifies the time from which gif should start. It must be in format of `hh:mm:ss.xxx` eg. `00:00:00.000`.
* `to` - It must be in format of `hh:mm:ss.xxx` eg. `00:00:10.000`
* `width` - width of generated gif must be a `number`
* `height` - height of generated gif must be a `number`
* `fps` - frame rate for generating gif must be `number`

## Events emitted

Follownig events are eimmited from the generated gif stream.

### Event `done` 

`done` is emitted when gif is created successfull without any errors.
Example:
```js
gifime(input, options)
  .then((gifStream) => {
    gifStream.pipe(output);
    gifStream.on('done', () => {
      console.log('gif successfuly generated');
    });
  })
  .catch(err, function doSomthingWithError(error){//do something});
```