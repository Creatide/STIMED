$(document).ready(function () {

  // Initialize plugin
  var stimed = new $.stimed({
    timeTarget: '.time',
    fps: 30,
    speedUp: 1000
  });

  // Header gradient style
  stimed.style.create([{
    target: '.masthead',
    time: '0',
    property: 'background',
    value: 'linear-gradient(0deg, #003e6a 0%, #011f3d 100%)'
  }, {
    target: '.masthead',
    time: '08:00',
    property: 'background',
    value: 'linear-gradient(180deg, #46A8F9 0%, #0C9AC9 100%)'
  }, {
    target: '.masthead',
    time: '12:00',
    property: 'background',
    value: 'linear-gradient(180deg, #f4d5a8 0%, #65b0db 100%)'
  }, {
    target: '.masthead',
    time: '20:00',
    property: 'background',
    value: 'linear-gradient(180deg, #0f7af0 0%, #003e6a 100%)'
  }, {
    target: '.masthead',
    time: '24:00',
    property: 'background',
    value: 'linear-gradient(360deg, #003e6a 0%, #011f3d 100%)'
  }]);

  // Header font shadow
  stimed.style.create([{
    target: '.text-shadow',
    time: '0',
    property: 'text-shadow',
    value: '2px 2px 8px black'
  }, {
    target: '.text-shadow',
    time: '10:00',
    property: 'text-shadow',
    value: '4px 4px 10px black'
  }, {
    target: '.text-shadow',
    time: '14:00',
    property: 'text-shadow',
    value: '-4px 4px 10px black'
  }, {
    target: '.text-shadow',
    time: '16:00',
    property: 'text-shadow',
    value: '-4px -2px 8px black'
  }, {
    target: '.text-shadow',
    time: '24:00',
    property: 'text-shadow',
    value: '2px 2px 8px black'
  }]);

  // Planet system
  stimed.style.preset({
    preset: 'rotate',
    target: '.planets'
  });

  // Sun
  stimed.style.create([{
    target: '.sun',
    time: '07:00',
    property: 'opacity',
    value: 0
  }, {
    target: '.sun',
    time: '10:00',
    property: 'opacity',
    value: 1
  }, {
    target: '.sun',
    time: '14:00',
    property: 'opacity',
    value: 0.8
  }, {
    target: '.sun',
    time: '17:00',
    property: 'opacity',
    value: 0
  }]);

  // Moon
  stimed.style.create([{
    target: '.moon',
    time: '18:30',
    property: 'opacity',
    value: 0
  }, {
    target: '.moon',
    time: '20:00',
    property: 'opacity',
    value: 1
  }, {
    target: '.moon',
    time: '03:00',
    property: 'opacity',
    value: 1
  }, {
    target: '.moon',
    time: '05:00',
    property: 'opacity',
    value: 0
  }]);

  // About text
  stimed.style.create({
    target: '.about-text',
    time: '06:00',
    property: 'color',
    value: '#cdcdcd'
  }, {
    target: '.about-text',
    time: '07:00',
    property: 'color',
    value: '#fff'
  }, {
    target: '.about-text',
    time: '19:00',
    property: 'color',
    value: '#fff'
  }, {
    target: '.about-text',
    time: '20:00',
    property: 'color',
    value: '#cdcdcd'
  });

  // About background
  stimed.style.create({
    target: '.about-bg',
    time: '06:00',
    property: 'background-color',
    value: '#1b2f3a'
  }, {
    target: '.about-bg',
    time: '07:00',
    property: 'background-color',
    value: '#2185d0'
  }, {
    target: '.about-bg',
    time: '19:00',
    property: 'background-color',
    value: '#2185d0'
  }, {
    target: '.about-bg',
    time: '20:00',
    property: 'background-color',
    value: '#1b2f3a'
  });

  // Contribute background
  stimed.style.create({
    target: '.contribute-bg',
    time: '06:00',
    property: 'background-color',
    value: '#1b2f3a'
  }, {
    target: '.contribute-bg',
    time: '07:00',
    property: 'background-color',
    value: '#dd4b39'
  }, {
    target: '.contribute-bg',
    time: '19:00',
    property: 'background-color',
    value: '#dd4b39'
  }, {
    target: '.contribute-bg',
    time: '20:00',
    property: 'background-color',
    value: '#1b2f3a'
  });

  // Cookie warning
  $('.cookie.nag')
    .nag({
      key: 'accepts-cookies',
      value: false
  });

  // Modal
  $(".disclaimer-button").click(function () {
    $('.ui.modal').modal('show');
  });
  // $('.ui.modal').modal('show');

  // Highlight.js settings
  hljs.configure({
    tabReplace: '  ',
    classPrefix: ''
  });
  
});