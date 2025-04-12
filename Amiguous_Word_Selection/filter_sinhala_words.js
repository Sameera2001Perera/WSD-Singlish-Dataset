const fs = require("fs");
const { search } = require("@ipmanlk/madura-api");

// Read the input file
const inputFile = "E:/4th Year/FYP/FYP-TEST/filtered_sinhala_words.txt";
const outputFile = "E:/4th Year/FYP/FYP-TEST/Filtered_Sinhala_Dictionary.txt";

// Read the file content
const fileContent = fs.readFileSync(inputFile, "utf-8");

// Replace single quotes with double quotes to make it valid JSON
const validJSONContent = fileContent.replace(/'/g, '"');

// Parse the file content into a structured object
const dictionary = {};
validJSONContent.split("\n").forEach((line) => {
  const [romanized, sinhalaWords] = line.split(":");
  if (romanized && sinhalaWords) {
    try {
      dictionary[romanized.trim()] = JSON.parse(sinhalaWords.trim());
    } catch (error) {
      console.error(`Error parsing line: ${line}`);
      console.error(error);
    }
  }
});

// Function to filter Sinhala words using the Madura API
async function filterWords() {
  // Clear the output file before starting
  fs.writeFileSync(outputFile, "", "utf-8");

  for (const [romanized, sinhalaWords] of Object.entries(dictionary)) {
    const validSinhalaWords = [];

    // Create an array of promises for all words
    const promises = sinhalaWords.map(async (word) => {
    //   console.log(`Processing word: ${word}`); // Print the word being processed

      try {
        const meanings = await search(word);

        // Check if the word exists in the dictionary
        if (meanings.length > 0) {
          console.log(`→ Word "${word}" exists in the dictionary.`);
          validSinhalaWords.push(word);
        } else {
          console.log(`→ Word "${word}" does NOT exist in the dictionary.`);
        }
      } catch (error) {
        // Handle API errors
        console.error(`→ Error processing word "${word}": ${error.message}`);
        validSinhalaWords.push(`${word}-Error`); // Include the word with "Error" suffix
      }
    });

    // Wait for all promises to complete
    await Promise.all(promises);

    if (validSinhalaWords.length > 0) {
      // Write the valid words for the current Romanized key to the output file
      const outputLine = `${romanized}: ${JSON.stringify(validSinhalaWords)}\n`;
      fs.appendFileSync(outputFile, outputLine, "utf-8");
      console.log(`Written to file: ${outputLine.trim()}`);
    }
  }

  console.log(`Filtered dictionary written to ${outputFile}`);
}

// Run the filtering process
filterWords();