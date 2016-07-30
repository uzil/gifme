'use strict';

const spawn = require('child_process').spawn;
const fs = require('fs');
const Promise = require('bluebird');

const parseOptions = (optionsArray) => {
  if (optionsArray === undefined) {
    optionsArray = [];
  }
  if (!optionsArray.from) {
    optionsArray.from = '00:00:00.000';
  }
  if (!optionsArray.to) {
    optionsArray.to = '00:00:10.000';
  }
  if (!optionsArray.width && !optionsArray.height) {
    optionsArray.width = 320;
    optionsArray.height = 240;
  } else if (optionsArray.width && !optionsArray.height) {
    optionsArray.height = optionsArray.width;
  } else if (!optionsArray.width && optionsArray.height) {
    optionsArray.width = optionsArray.height;
  }
  if (!optionsArray.fps) {
    optionsArray.fps = 10;
  }
  optionsArray.height = Math.round(optionsArray.height);
  optionsArray.width = Math.round(optionsArray.width);
  optionsArray.fps = Math.round(optionsArray.fps);
  return optionsArray;
};

const checkOptionsFormat = (optionsArray) => {
  let timeFormat = /^([0-9]{2})\:([0-9]{2})\:([0-9]{2})\.([0-9]{3})$/;
  if ((timeFormat.test(optionsArray.from) === false) || (timeFormat.test(optionsArray.to) === false)) {
    return new Error('InvalidFormat: Time duration format must be hh:mm:ss.xxx');
  } else if (typeof optionsArray.fps !== 'number') {
    return new Error('InvalidFormat: Options fps must be number');
  } else if (optionsArray.fps < 1) {
    return new Error('InvalidFormat: Options fps must be greater than 1');
  } else if ((typeof optionsArray.width !== 'number') || (typeof optionsArray.height !== 'number')) {
    return new Error('InvalidFormat: width and height must be number');
  } else if ((optionsArray.width < 10) || (optionsArray.height < 10)) {
    return new Error('InvalidFormat: width and height must be greater than or equal to 10');
  } else return 1;
};

const createFFmpegArgs = (optionsArray) => {
  let args = [];
  args.push('-i', 'pipe:0');
  args.push('-ss', optionsArray.from);
  args.push('-to', optionsArray.to);
  args.push('-pix_fmt', 'rgb24');
  args.push('-r', optionsArray.fps);
  args.push('-s', optionsArray.width + 'x' + optionsArray.height);
  args.push('-f', 'gif');
  args.push('pipe:1');
  console.log(args);
  return args;
};

const requestFileReadStream = (path) => {
  return new Promise((resolve, reject) => {
    let videoStream = fs.createReadStream(path);
    videoStream.on('error', (err) => {
      reject(err);
    });
    videoStream.on('open', (fd) => {
      resolve(videoStream);
    });
  });
};

const callFFmpeg = (videoStream, options) => {
  let ffmpeg = spawn('ffmpeg', createFFmpegArgs(options));
  videoStream.pipe(ffmpeg.stdin);
  ffmpeg.stdin.on('error', function ignoreThisError() {});
  ffmpeg.on('close', (code) => {
    if (code === 0) {
      let msg = 'Gif Stream successfuly closed';
      ffmpeg.stdout.emit('done', msg);
    }
  });
  return ffmpeg.stdout;
};

module.exports = (video, options) => {
  return new Promise((resolve, reject) => {
    options = parseOptions(options);
    let checkVariable = checkOptionsFormat(options);
    if (checkVariable !== 1) {
      reject(checkVariable);
    }
    if (typeof video === 'string') {
      requestFileReadStream(video)
        .then((videoStream) => {
          resolve(callFFmpeg(videoStream, options));
        })
        .catch(reject);
    } else {
      resolve(callFFmpeg(video, options));
    }
  });
};