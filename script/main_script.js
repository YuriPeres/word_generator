// Constants
const DEFAULT_CHARACTERS = 12;
const VOWELS = 'aeiouáàâãéêíóôõúüAEIOUÁÀÂÃÉÊÍÓÔÕÚÜ';
const CONSONANTS = 'bcdfghjklmnpqrstvwxyzçBCDFGHJKLMNPQRSTVWXYZÇ';
const NUMBERS = '0123456789';
const SPECIAL_CHARS = '¡!@#$%^&*()_+-=[]{}|;:,.<>?/\\';

// DOM Elements
const howManyToListInput = document.getElementById('num-respostas');
const anagramInput = document.getElementById('lista-palavras');
const charactersInput = document.getElementById('num-caracteres');
const wordsInput = document.getElementById('num-palavras');
const vowelsInput = document.getElementById('num-vogais');
const consonantsInput = document.getElementById('num-consoantes');
const numbersInput = document.getElementById('num-numeros');
const specialCharsInput = document.getElementById('num-especiais');
const form = document.getElementById('formulario');
const generatedNameElement = document.getElementById('nome-gerado');

// Helper Functions
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

function countCharacters(str, charSet) {
  return str.split('').filter(char => charSet.includes(char)).length;
}

function calculateMaxWords(characters) {
  const maxWords = Math.floor(characters / 2);
  return maxWords > 1 ? maxWords : 1;
}


// Main Functions
function updateSettings(event) {
  // anagramInput.value = anagramInput.value.toLowerCase();
  const anagramText = anagramInput.value.trim();
  const useAnagram = anagramText.length > 0;

  let totalCharacters, words, vowels, consonants, numbers, specialChars;

  if (useAnagram) {
    const cleanedText = anagramText.replaceAll(/\s+/g, ' ');
    totalCharacters = cleanedText.replaceAll(' ', '').length;
    charactersInput.max = totalCharacters;
    charactersInput.value = totalCharacters;
    words = countCharacters(cleanedText, " ") + 1;
    vowels = countCharacters(cleanedText, VOWELS);
    consonants = countCharacters(cleanedText, CONSONANTS);
    numbers = countCharacters(cleanedText, NUMBERS);
    specialChars = countCharacters(cleanedText, SPECIAL_CHARS);

  } else {
    charactersInput.max = 60;
    totalCharacters = parseInt(charactersInput.value) || DEFAULT_CHARACTERS;
    words = calculateMaxWords(totalCharacters);
    vowels = consonants = numbers = specialChars = totalCharacters;
    charactersInput.value = totalCharacters;
  }
  // Update input values

  wordsInput.value = words;
  vowelsInput.value = vowels;
  consonantsInput.value = consonants;
  numbersInput.value = numbers;
  specialCharsInput.value = specialChars;

  // Update max attributes
  wordsInput.max = calculateMaxWords(totalCharacters);
  vowelsInput.max = vowels;
  consonantsInput.max = consonants;
  numbersInput.max = numbers;
  specialCharsInput.max = specialChars;
}

function generateName(event) {
  event.preventDefault();

  checkFields();

  const settings = {
    characters: parseInt(charactersInput.value),
    vowels: parseInt(vowelsInput.value),
    consonants: parseInt(consonantsInput.value),
    numbers: parseInt(numbersInput.value),
    specialChars: parseInt(specialCharsInput.value),
    anagramWords: anagramInput.value.replaceAll(/\s+/g, ' ').split(' ').map(item => item.trim()).join('').trim()
  };

  let howManyToList = howManyToListInput.value;
  /*  +#=======#+
      ||ANAGRAM||
      +#=======#+  */
  if (settings.anagramWords.length > 0) {
    // removeLetters(anagramResult);

    deleteParagrafhs();
    let resultsList = new Set();
    let maxLoop = 100;
    while ((howManyToList != resultsList.size) && (maxLoop > 0)) {
      // Anagram name generation
      const anagramResult = settings.anagramWords.split('').sort(() => Math.random() - 0.5).join('');
      resultsList.add(puttingSpaces(removeLetters(anagramResult, settings)));
      maxLoop--;
      // createParagraph(puttingSpaces(removeLetters(anagramResult, settings)));
      // howManyToList--;
    }
    resultsList.forEach(result => {
      createParagraph(result);
    });
  }
  else {
    /*  +#======#+
        ||RANDOM||
        +#======#+ */
    // Check the sum of the filters
    const totalFilters = settings.vowels + settings.consonants + settings.numbers + settings.specialChars;

    if (totalFilters > settings.characters) {
      // Adjust the proportions
      const totalToDistribute = settings.characters;
      const proportions = {
        vowels: settings.vowels / totalFilters,
        consonants: settings.consonants / totalFilters,
        numbers: settings.numbers / totalFilters,
        specialChars: settings.specialChars / totalFilters,
      };

      settings.vowels = Math.round(totalToDistribute * proportions.vowels);
      settings.consonants = Math.round(totalToDistribute * proportions.consonants);
      settings.numbers = Math.round(totalToDistribute * proportions.numbers);
      settings.specialChars = Math.round(totalToDistribute * proportions.specialChars);

    } else if (totalFilters < settings.characters) {
      settings.characters = totalFilters;
    }

    // Name generation based on filters
    deleteParagrafhs();
    let resultsList = new Set();
    let maxLoop = 100;
    while ((howManyToList != resultsList.size) && maxLoop > 0) {
      let randomWord = (VOWELS + CONSONANTS + NUMBERS + SPECIAL_CHARS).repeat(6);
      randomWord = removeLetters(randomWord, settings);

      if (randomWord.length > settings.characters) {
        randomWord = randomWord.substring(0, settings.characters);
      }
      else if ((randomWord.length < settings.characters) && (totalFilters > settings.characters)) {
        randomWord = addLetteres(randomWord, settings);
      }
      randomWord = puttingSpaces(randomWord);
      resultsList.add(randomWord);
      maxLoop--;
    }
    resultsList.forEach(result => {
      createParagraph(result);
    });
  }
  generatedNameElement.scrollIntoView({ behavior: 'smooth' });
}


function removeLetters(word, settings) {
  let diff = countCharacters(word, VOWELS) - settings.vowels;
  diff = Math.min(diff, countCharacters(word, VOWELS));

  function remover(wordToModify, diff, charSet) {
    if (diff > 0) {
      const index = Math.floor(Math.random() * wordToModify.length);
      const randomLetter = wordToModify[index];
      if (charSet.includes(randomLetter)) {
        wordToModify = wordToModify.slice(0, index) + wordToModify.slice(index + 1);
        diff--;
      }
    }
    if (diff === 0) {
      return wordToModify;
    }
    else {
      return remover(wordToModify, diff, charSet);
    }
  };

  let result = remover(word, diff, VOWELS);

  diff = countCharacters(result, CONSONANTS) - settings.consonants;
  diff = Math.min(diff, countCharacters(result, CONSONANTS));
  result = remover(result, diff, CONSONANTS);

  diff = countCharacters(result, NUMBERS) - settings.numbers;
  diff = Math.min(diff, countCharacters(result, NUMBERS));
  result = remover(result, diff, NUMBERS);

  diff = countCharacters(result, SPECIAL_CHARS) - settings.specialChars;
  diff = Math.min(diff, countCharacters(result, SPECIAL_CHARS));
  result = remover(result, diff, SPECIAL_CHARS);

  return result;
}

function addLetteres(randomWord, settings) {

  let numVowels = settings.vowels,
    numConsonants = settings.consonants,
    numNumbers = settings.numbers,
    numSpecialChars = settings.specialChars;

  let values = [
    { name: 'VOWELS', value: numVowels },
    { name: 'CONSONANTES', value: numConsonants },
    { name: 'NUMBERS', value: numNumbers },
    { name: 'SPECIAL_CHARS', value: numSpecialChars }
  ];

  let maxLoop = 200;
  values.sort((a, b) => b.value - a.value);
  while (randomWord.length < settings.characters) {
    if (values[0].value > 0) {
      switch (values[0].name) {
        case 'VOWELS':
          randomWord = randomWord + VOWELS[Math.floor(Math.random() * VOWELS.length)];
          break;
        case 'CONSONANTES':
          randomWord = randomWord + CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)];
          break;
        case 'NUMBERS':
          randomWord = randomWord + NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
          break;
        case 'SPECIAL_CHARS':
          randomWord = randomWord + SPECIAL_CHARS[Math.floor(Math.random() * SPECIAL_CHARS.length)];
          break;
      }
      values[0].value--;
      values.sort((a, b) => b.value - a.value);
    }
    maxLoop--;
    if (maxLoop === 0) {
      return randomWord;
    }
  }
  return randomWord;
}

function puttingSpaces(word) {
  const numberOfWords = wordsInput.value;
  const maxValue = Math.floor(word.length / 2);
  if ((word.length < 3) || (numberOfWords == 1)) {
    return word;
  }
  else if (word.length == 4) {
    word = word.slice(0, 2) + " " + word.slice(2);
    return word;
  }

  let spaces = numberOfWords;
  if (maxValue < numberOfWords) {
    spaces = maxValue;
  }

  let wordSplited = [...Array(parseInt(spaces))];
  for (let i = 0; i < wordSplited.length; i++) {
    wordSplited[i] = word.slice(0, 1)
    word = word.slice(1);
    wordSplited[i] += word.slice(0, 1)
    word = word.slice(1);
  }
  while (word.length > 0) {
    const randomIndex = Math.floor(Math.random() * wordSplited.length);
    wordSplited[randomIndex] += word.slice(0, 1)
    word = word.slice(1);
  }
  word = wordSplited.join(' ');
  return word;
}

function createParagraph(mensagem) {
  const div = document.getElementById('nome-gerado');

  const paragrafo = document.createElement('p');

  paragrafo.classList.add('nomes-gerados', 'fs-4', 'fw-bold', 'coloredText');

  paragrafo.textContent = mensagem.split(' ')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  .join(' ');

  div.appendChild(paragrafo);
}

function deleteParagrafhs() {
  const div = document.getElementById('nome-gerado');
  const paragrafos = div.querySelectorAll('p');
  paragrafos.forEach(paragrafo => paragrafo.remove());
}

const currentPage = window.location.pathname.split().pop();

if (currentPage.includes("en")) {
  createParagraph("Here will be displayed the generated name.");
} else if (currentPage.includes("es")) {
  createParagraph("Aquí se mostrará el nombre generado.");
} else {
  createParagraph("Aqui será exibido o nome gerado.")
}

function checkFields() {
  let inputsList = new Array();
  inputsList.push(howManyToListInput);
  inputsList.push(charactersInput);
  inputsList.push(wordsInput);
  inputsList.push(vowelsInput);
  inputsList.push(consonantsInput);
  inputsList.push(numbersInput);
  inputsList.push(specialCharsInput);

  inputsList.forEach(item => {
    if (!Number.isInteger(parseInt(item.value))) {
      item.value = item.min;
    }
  });
};

// Event Listeners
anagramInput.addEventListener('input', debounce(updateSettings, 500));
charactersInput.addEventListener('input', debounce(updateSettings, 500));
form.addEventListener('submit', generateName);

// Initial setup
updateSettings();

// Identifies address and colors the flag
document.addEventListener("DOMContentLoaded", function () {
  const currentPage = window.location.pathname.split().pop(); 

  const langMap = {
    "/": "br",
    "/en/": "us",
    "/es/": "es"
  };

  document.querySelectorAll("#bandeiras img").forEach((img) => {
    if (img.src.includes(langMap[currentPage])) {
      img.classList.add("selecionada");
    } else {
      img.classList.remove("selecionada");
    }
  });
});