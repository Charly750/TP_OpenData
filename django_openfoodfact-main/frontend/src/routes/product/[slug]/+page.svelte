<script lang="ts">
	import axios from 'axios';
    import type { PageData } from './$types';
	import { onMount } from 'svelte';
    import Navbar from "../../../composents/Navbar.svelte";
    import PopUp from "../../../composents/PopUp.svelte";

    // Define the URL based on the environment
    const isProduction = process.env.NODE_ENV === 'production';
    console.log('isProduction: ', isProduction);
    let url = 'http://127.0.0.1:8000/';
    if (isProduction) {
        url = "https://django-openfoodfact.onrender.com/";
    }
	
	export let data: PageData;

    console.log(data.id)

    type Product = {
        product_name: string,
        nutrition_grades: string,
        image_front_url: string
        nutriments: {
            "energy-kcal": string,
            fat_100g: number,
            salt_100g: number,
            sugars_100g: number,
            sodium_100g: number, 
            fiber_100g: number
        }
    }

    let product_scanned: Product
    let isLoading = true
    let isOpen = false

    onMount(async() => {
        const token = document.cookie
                                    .split("; ")
                                    .find((row) => row.startsWith("token="))
                                    ?.split("=")[1];
        try{
            const res = await axios.get(`${url}api/product/?code=${data.id}`, {
                headers:{
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json"
                }
            })
            if(res.status === 200){
                console.log(res.data.product_name)
                product_scanned = res.data
                isLoading = false
            }
        } catch(err){
            console.error(err)
            return
        }
    })

</script>

<Navbar>
    <button class="text-white" on:click={() => (isOpen = true)}> Scanner un produit </button>
</Navbar>

<PopUp
bind:isOpen
/>

{#if isLoading === false}
    <div class="bg-white shadow-md rounded-lg p-4 mb-4">
        <div class="flex items-center mb-2">
            <img src={product_scanned.image_front_url} alt={product_scanned.product_name}/>
            <h1>Nom :{product_scanned.product_name}</h1>
            <p>Nutriscore: {product_scanned.nutrition_grades}</p>
            <p>Calories: {product_scanned.nutriments['energy-kcal']}kcal</p>
            <p>Gras pour 100g: {product_scanned.nutriments.fat_100g}g</p>
            <p>Fibre pour 100g: {product_scanned.nutriments.fiber_100g}g</p>
            <p>Sel pour 100g: {product_scanned.nutriments.salt_100g}g</p>
            <p>Sodium pour 100g: {product_scanned.nutriments.sodium_100g}g</p>
            <p>Sucre pour 100g: {product_scanned.nutriments.sugars_100g}g</p>
        </div>
    </div>
{/if}
