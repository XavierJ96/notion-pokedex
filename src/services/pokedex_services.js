const axios = require("axios");
const { Client } = require("@notionhq/client");
require("dotenv").config();

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const pokeArray = [];

const getLastItemId = async () => {
  try {
    const response = await axios.get("https://pokeapi.co/api/v2/pokemon/");
    const lastItemId = response.data.count;
    return lastItemId;
  } catch (error) {
    throw new Error("Error fetching data count:", error);
  }
};

const getAllPokemons = async () => {
  for (let i = 1; i <= 10; i++) {
    await axios
      .get(`https://pokeapi.co/api/v2/pokemon/${i}`)
      .then((poke) => {
        const typesArray = [];

        for (let type of poke.data.types) {
          const typeObj = {
            name: type.type.name,
          };
          typesArray.push(typeObj);
        }

        const processedName = poke.data.species.name
          .split(/-/)
          .map((name) => {
            return name[0].toUpperCase() + name.substring(1);
          })
          .join(" ")
          .replace(/^Mr M/, "Mr. M")
          .replace(/^Mime Jr/, "Mime Jr.")
          .replace(/^Mr R/, "Mr. R")
          .replace(/mo O/, "mo-o")
          .replace(/Porygon Z/, "Porygon-Z")
          .replace(/Type Null/, "Type: Null")
          .replace(/Ho Oh/, "Ho-Oh")
          .replace(/Nidoran F/, "Nidoran♀")
          .replace(/Nidoran M/, "Nidoran♂")
          .replace(/Flabebe/, "Flabébé");

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
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  createNotionPage();
};

const createNotionPage = async () => {
  for (let pokemon of pokeArray) {

    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: process.env.NOTION_DATABASE_ID,
      },
      cover: {
        type: "external",
        external: {
          url: pokemon.artwork,
        },
      },
      icon: {
        type: "external",
        external: {
          url: pokemon.sprite,
        },
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
        Type: { multi_select: pokemon.types },
        Height: { number: pokemon.height },
        Weight: { number: pokemon.weight },
        HP: { number: pokemon.hp },
        Attack: { number: pokemon.attack },
        Defense: { number: pokemon.defense },
        "Sp. Attack": { number: pokemon["special-attack"] },
        "Sp. Defense": { number: pokemon["special-defense"] },
        Speed: { number: pokemon.speed },
      },
      children: [{
        object: "block",
        type: "bookmark",
        bookmark: {
          url: pokemon.bulbURL
        }
      }],
    });
  }
};

getAllPokemons();

module.exports = { getAllPokemons };
