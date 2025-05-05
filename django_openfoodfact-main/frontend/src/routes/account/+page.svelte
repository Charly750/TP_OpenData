<script lang="ts">
    import { onMount } from 'svelte';
    import axios from 'axios';
    import Navbar from '../../composents/Navbar.svelte';
    import PopUp from "../../composents/PopUp.svelte";
    let isOpen = false;

    let searches: any[] = [];

    // Define the URL based on the environment
    const isProduction = process.env.NODE_ENV === 'production';
    console.log('isProduction: ', isProduction);
    let url = 'http://127.0.0.1:8000/';
    if (isProduction) {
        url = "https://django-openfoodfact.onrender.com/";
    }

    // Function to fetch user searches from the API
    const fetchUserSearches = async () => {
        try {
            const response = await axios.get(`${url}api/user-searches/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${getCookie('token')}`
                }
            });
            searches = response.data;
        } catch (error) {
            console.error("Error fetching user searches:", error);
        }
    };

    // Function to get the value of a cookie by name
    const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        // @ts-ignore
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    // Function to delete a single search by ID
    const deleteSearch = async (id: number) => {
        try {
            await axios.delete(`${url}api/user-searche/${id}/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${getCookie('token')}`
                }
            });
            // Refresh the list of searches
            fetchUserSearches();
        } catch (error) {
            console.error("Error deleting search:", error);
        }
    };

    // Function to delete all searches
    const deleteAllSearches = async () => {
        try {
            await axios.delete(`${url}api/user-searches/delete-all/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${getCookie('token')}`
                }
            });
            // Refresh the list of searches
            fetchUserSearches();
        } catch (error) {
            console.error("Error deleting all searches:", error);
        }
    };

    // Function to normalize string by replacing spaces with hyphens and removing accents
    const normalizeString = (str: string) => {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9- ]/g, '') // Keep existing hyphens and alphanumeric characters
            .replace(/\s+/g, '-'); // Replace spaces with hyphens
    };

    // Function to redirect to the add/modify substitute page
    const redirectToSubstitutePage = (id: number, categories_tags: string[], nutrition_grades: string, action: string) => {
        const categories_tags_fr = categories_tags.length > 0 ? normalizeString(categories_tags[0]) : '';
        const url_redirect = `./home?id=${id}&categories_tags_fr=${categories_tags_fr}&nutrition_grades_tags=${nutrition_grades}`;
        window.location.href = url_redirect;
    };

    // Fetch user searches on component mount
    onMount(() => {
        fetchUserSearches();
    });
</script>

<Navbar>
    <button class="text-white" on:click={() => (isOpen = true)}> Scanner un produit </button>
</Navbar>

<PopUp
bind:isOpen
/>

<main class="p-4">
    <h1 class="text-2xl font-bold mb-4 mt-12">Mon compte</h1>
    {#if searches.length > 0}
        <button on:click={deleteAllSearches} class="bg-red-500 text-white px-4 py-2 rounded mb-4">Supprimer toutes les recherches</button>
    {/if}
    <div>
        {#if searches.length === 0}
            <p class="text-gray-600">Aucune recherche effectuée pour le moment.</p>
        {:else}
            {#each searches as search (search.id)}
                <div class="bg-white shadow-md rounded-lg p-4 mb-4">
                    {#if search.food && search.food.product_name && search.food.nutrition_grades}
                        <div class="flex items-center mb-2">
                            {#if search.food.image_front_url}
                                <img src={search.food.image_front_url} alt={search.food.product_name} class="w-20 h-20 object-cover mr-4"/>
                            {/if}
                            <div>
                                {#if search.food.product_name}
                                    <h2 class="text-xl font-semibold"><a href={`https://fr.openfoodfacts.org/produit/${search.food.code}`}>{search.food.product_name}</a></h2>
                                {/if}
                                {#if search.food.nutrition_grades}
                                    <p class="text-gray-600">Nutrition Grade: {search.food.nutrition_grades.toUpperCase()}</p>
                                {/if}
                                {#if search.food.nutriments && search.food.nutriments['energy-kcal']}
                                    <p class="text-gray-600">Calories: {search.food.nutriments['energy-kcal']} kcal</p>
                                {/if}
                            </div>
                        </div>
                        {#if search.substitute && search.substitute.product_name && search.substitute.nutrition_grades}
                            <div class="mt-4">
                                <h3 class="text-lg font-medium">Substitute:</h3>
                                <div class="flex items-center mt-2">
                                    {#if search.substitute.image_front_url}
                                        <img src={search.substitute.image_front_url} alt={search.substitute.product_name} class="w-20 h-20 object-cover mr-4"/>
                                    {/if}
                                    <div>
                                        {#if search.substitute.product_name}
                                            <h2 class="text-xl font-semibold"><a href={`https://fr.openfoodfacts.org/produit/${search.substitute.code}`}>{search.substitute.product_name}</a></h2>
                                        {/if}
                                        {#if search.substitute.nutrition_grades}
                                            <p class="text-gray-600">Nutrition Grade: {search.substitute.nutrition_grades.toUpperCase()}</p>
                                        {/if}
                                        {#if search.substitute.nutriments && search.substitute.nutriments['energy-kcal']}
                                            <p class="text-gray-600">Calories: {search.substitute.nutriments['energy-kcal']} kcal</p>
                                        {/if}
                                    </div>
                                </div>
                                <button on:click={() => redirectToSubstitutePage(search.id, search.food.categories_tags, search.food.nutrition_grades, 'modifier')} class="bg-blue-500 text-white px-2 py-1 rounded mt-2">Modifier le substitut</button>
                            </div>
                        {:else}
                            <button on:click={() => redirectToSubstitutePage(search.id, search.food.categories_tags, search.food.nutrition_grades, 'ajouter')} class="bg-green-500 text-white px-2 py-1 rounded mt-2">Ajouter un substitut</button>
                        {/if}
                    {/if}
                    <p class="text-gray-500 text-sm mt-4">Searched at: {new Date(search.searched_at).toLocaleString()}</p>
                    <button on:click={() => deleteSearch(search.id)} class="bg-red-500 text-white px-2 py-1 rounded mt-2">Supprimer</button>
                </div>
            {/each}
        {/if}
    </div>
</main>

<style>
    main {
        max-width: 800px;
        margin: 0 auto;
    }
</style>
