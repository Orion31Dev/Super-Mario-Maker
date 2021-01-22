import { animateFlexContainers } from './const';
import { levelExists } from './sockets';

const input = document.getElementById('level') as HTMLInputElement;
const play = document.getElementById('btn-play');

let code = "";

play?.addEventListener('click', () => {
  if (/^[a-zA-Z0-9]{5}$/.test(input.value)) {
    levelExists(input.value.toUpperCase(), existsCallback);
    code = input.value;
  } 
  else shakeInput();
});

const existsCallback = (exists: boolean) => {
  if (!exists) shakeInput();
  else window.location.href = "/play/" + code;
};

const shakeInput = () => {
  input.animate(
    [
      { transform: 'translate(2px, 1px) rotate(0deg)' },
      { transform: 'translate(-1px, -2px) rotate(-1deg)' },
      { transform: 'translate(-3px, 0px) rotate(1deg)' },
      { transform: 'translate(0px, 2px) rotate(0deg)' },
      { transform: 'translate(1px, -1px) rotate(1deg)' },
      { transform: 'translate(-1px, 2px) rotate(-1deg)' },
      { transform: 'translate(-3px, 1px) rotate(0deg)' },
      { transform: 'translate(2px, 1px) rotate(-1deg)' },
      { transform: 'translate(-1px, -1px) rotate(1deg)' },
      { transform: 'translate(2px, 2px) rotate(0deg)' },
      { transform: 'translate(1px, -2px) rotate(-1deg)' },
    ],
    {
      iterations: 1,
      duration: 300,
    }
  );
};

animateFlexContainers();
