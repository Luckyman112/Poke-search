async function fetchPokemon(nameOrId = null) {
    const output = document.getElementById('output');
    const inputField = document.getElementById('pokemon-name');
    let input = nameOrId ? nameOrId : inputField.value.trim().toLowerCase();

    if (!input) {
        output.innerHTML = `<p class="text-red-500">Please enter a Pokémon name or ID.</p>`;
        return;
    }

    output.innerHTML = `
        <div class="flex justify-center">
            <div class="animate-spin h-8 w-8 border-t-4 border-blue-500 rounded-full"></div>
        </div>`;

    try {
        // Получаем основную информацию о покемоне
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${input}`);
        if (!response.ok) throw new Error("Pokémon not found");
        const data = await response.json();

        // Получаем описание покемона
        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();

        // Получаем цепочку эволюций
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();

        // Формируем массив эволюций
        const evolutions = getEvolutions(evolutionData.chain);

        // Ищем английское описание, если нет — пишем "No description available"
        const descriptionEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === "en");
        const description = descriptionEntry ? descriptionEntry.flavor_text.replace(/[\n\f]/g, ' ') : "No description available.";

        displayPokemon(data, description, evolutions);
    } catch (error) {
        output.innerHTML = `<p class='text-red-500'>Error: Pokémon not found.</p>`;
    }
}

function fetchRandomPokemon() {
    const randomId = Math.floor(Math.random() * 898) + 1;
    fetchPokemon(randomId); // Передаем ID напрямую в fetchPokemon()
}

function displayPokemon(pokemon, description, evolutions) {
    const output = document.getElementById('output');

    const types = pokemon.types.map(type => 
        `<span class="px-2 py-1 rounded text-white ${getTypeColor(type.type.name)}">${type.type.name}</span>`
    ).join(" ");

    const stats = pokemon.stats.map(stat => `
        <div class="mt-2">
            <p class="text-gray-700">${stat.stat.name}: <b>${stat.base_stat}</b></p>
            <div class="w-full bg-gray-200 rounded-full h-4">
                <div class="bg-blue-500 h-4 rounded-full" style="width: ${Math.min(stat.base_stat, 100)}%;"></div>
            </div>
        </div>
    `).join("");

    const evolutionHTML = evolutions.length > 1 ? `
        <h3 class="text-lg font-bold mt-4">Evolutions:</h3>
        <div class="flex justify-center gap-4 mt-2">
            ${evolutions.map(evo => `
                <div class="text-center">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png" 
                        class="w-16 h-16 mx-auto">
                    <p class="text-gray-700 text-sm font-bold">${evo.name}</p>
                </div>
            `).join("")}
        </div>
    ` : "";

    output.innerHTML = `
        <div class="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-bold">${pokemon.name.toUpperCase()}</h2>
            <div class="flex justify-center gap-4">
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="my-2">
                <img src="${pokemon.sprites.back_default}" alt="${pokemon.name}" class="my-2">
            </div>
            <p class="text-gray-700"><b>Height:</b> ${pokemon.height / 10} m</p>
            <p class="text-gray-700"><b>Weight:</b> ${pokemon.weight / 10} kg</p>
            <p class="mt-2"><b>Type:</b> ${types}</p>
            <h3 class="text-lg font-bold mt-4">Stats:</h3>
            ${stats}
            <h3 class="text-lg font-bold mt-4">Description:</h3>
            <p class="text-gray-600 italic">${description}</p>
            ${evolutionHTML}
        </div>
    `;
}

// Функция получения цепочки эволюций
function getEvolutions(chain) {
    let evolutions = [];
    let current = chain;

    while (current) {
        let id = current.species.url.split("/").slice(-2, -1)[0]; // Достаем ID покемона из URL
        evolutions.push({ name: current.species.name, id });
        current = current.evolves_to.length ? current.evolves_to[0] : null;
    }
    
    return evolutions;
}

// Функция выбора цвета для типа покемона
function getTypeColor(type) {
    const colors = {
        normal: "bg-gray-500",
        fire: "bg-red-500",
        water: "bg-blue-500",
        grass: "bg-green-500",
        electric: "bg-yellow-500",
        ice: "bg-cyan-500",
        fighting: "bg-orange-500",
        poison: "bg-purple-500",
        ground: "bg-yellow-700",
        flying: "bg-indigo-500",
        psychic: "bg-pink-500",
        bug: "bg-lime-500",
        rock: "bg-yellow-900",
        ghost: "bg-violet-500",
        dragon: "bg-red-700",
        dark: "bg-gray-800",
        steel: "bg-gray-600",
        fairy: "bg-pink-400"
    };
    return colors[type] || "bg-gray-500";
}
