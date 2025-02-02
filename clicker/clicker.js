import { loggedUser, updateClickerScore } from '../database.js';

var score = 0;
export function setScore(userScore) {
    score = userScore;
}
function addBee() {
    var bee = document.createElement('img');
    bee.src = 'img/abeille.png';
    bee.classList.add('bee');
    let startSide = Math.random() < 0.5 ? 'left' : 'right';
    bee.style[startSide] = '-50px';
    bee.style.top = Math.random() * 90 + 'vh';
    bee.style.animationDuration = Math.random() * 2 + 3 + 's';
    bee.style.animationDelay = Math.random() * 2 + 's';
    if (startSide === 'left') {
        bee.style.animationName = 'moveRight';
        bee.style.transform = 'rotate(90deg)';
    } else {
        bee.style.animationName = 'moveLeft';
        bee.style.transform = 'rotate(-90deg)';
    }
    document.body.appendChild(bee);
    bee.addEventListener('animationend', function () {
        bee.remove();
    });
}
document.addEventListener('DOMContentLoaded', function () {
    var button = document.getElementById('clickButton');
    var counter = document.getElementById('score');

    button.addEventListener('click', function () {
        button.classList.add('clicked');
        score++;
        counter.textContent = score;
        addBee();
        if (loggedUser !== null) {
            updateClickerScore(loggedUser.username, score);
        }
        setTimeout(function () {
            button.classList.remove('clicked');
        }, 100);
    });
});