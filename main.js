const generateBtn = document.getElementById('generate-btn');
const numbersContainer = document.querySelector('.lotto-numbers');

generateBtn.addEventListener('click', () => {
  // Clear previous numbers and reset animation
  numbersContainer.innerHTML = '';

  const numbers = new Set();
  while (numbers.size < 6) {
    const random = Math.floor(Math.random() * 45) + 1;
    numbers.add(random);
  }

  const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

  sortedNumbers.forEach((number, index) => {
    const numberDiv = document.createElement('div');
    numberDiv.classList.add('number');
    numberDiv.textContent = number;
    numberDiv.style.backgroundColor = getBackgroundColor(number);
    // Stagger the animation start time
    numberDiv.style.animationDelay = `${index * 0.1}s`;
    numbersContainer.appendChild(numberDiv);
  });
});

function getBackgroundColor(number) {
  if (number <= 10) {
    return '#ffc107'; // Gold
  } else if (number <= 20) {
    return '#c0c0c0'; // Silver
  } else if (number <= 30) {
    return '#cd7f32'; // Bronze
  } else if (number <= 40) {
    return '#87ceeb'; // Sky Blue
  } else {
    return '#98ff98'; // Mint Green
  }
}