const dduJjonKuBtn = document.getElementById('ddu-jjon-ku-btn');
const chestnutContainer = document.getElementById('chestnut-container');

dduJjonKuBtn.addEventListener('click', () => {
  // Make the container visible if it's the first click
  if (chestnutContainer.classList.contains('hidden')) {
    chestnutContainer.classList.remove('hidden');
  }

  // Create a new chestnut element
  const newChestnut = document.createElement('span');
  newChestnut.classList.add('chestnut');
  newChestnut.textContent = '🌰';

  // Add random horizontal position
  const randomX = (Math.random() - 0.5) * 200; // -100px to +100px
  newChestnut.style.transform = `translateX(${randomX}px)`;

  // Add the new chestnut to the container
  chestnutContainer.appendChild(newChestnut);

  // Remove the chestnut after the animation is over to keep the DOM clean
  setTimeout(() => {
    newChestnut.remove();
  }, 2000); // 2 seconds
});
