'use strict';

(() => {
  const players = [...document.querySelectorAll('audio')];
  players.forEach(player => player.addEventListener('play', () => {
    players.forEach(other => {
      if (other !== player && !other.paused) other.pause();
    });
  }));
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
