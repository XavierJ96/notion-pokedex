const axios = require("axios");
const { Client } = require("@notionhq/client");
require("dotenv").config();

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

console.log(process.env.NOTION_TOKEN);

const pokeArray = [];

const getAllPokemons = async () => {
  for (let i = 1; i <= 10; i++) {
  await axios
      .get(`https://pokeapi.co/api/v2/pokemon/${i}`)
    .then((poke) => {
        const bulbURL = `https://bulbapedia.bulbagarden.net/wiki/${processedName.replace(
          " ",
          "_"
        )}_(Pokémon)`;

        const sprite = !poke.data.sprites.front_default
          ? poke.data.sprites.other["official-artwork"].front_default
          : poke.data.sprites.front_default;

      const pokeData = {
          name: processedName,
          number: poke.data.id,
          types: typesArray,
          hp: poke.data.stats[0].base_stat,
        height: poke.data.height,
        weight: poke.data.weight,
        attack: poke.data.stats[1].base_stat,
        defense: poke.data.stats[2].base_stat,
        "special-attack": poke.data.stats[3].base_stat,
        "special-defense": poke.data.stats[4].base_stat,
        speed: poke.data.stats[5].base_stat,
          sprite: sprite,
          artwork: poke.data.sprites.other["official-artwork"].front_default,
          bulbURL: bulbURL,
      };
      pokeArray.push(pokeData);
      console.log(`Fetching ${pokeData.name}`);
    })
    .catch((error) => {
      throw new Error(error);
    });
  }

  createNotionPage();
};

const createNotionPage = async () => {
  for (let pokemon of pokeArray) {
    console.log(pokemon.number);
    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: process.env.NOTION_DATABASE_ID,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: pokemon.name,
              },
            },
          ],
        },
        No: {
          number: pokemon.number,
        },
        Height: { number: pokemon.height },
        Weight: { number: pokemon.weight },
        HP: { number: pokemon.hp },
        Attack: { number: pokemon.attack },
        Defense: { number: pokemon.defense },
        "Sp. Attack": { number: pokemon["special-attack"] },
        "Sp. Defense": { number: pokemon["special-defense"] },
        Speed: { number: pokemon.speed },
      },
    });
    console.log(response);
  }
};

getAllPokemons();

module.exports = { getAllPokemons };
