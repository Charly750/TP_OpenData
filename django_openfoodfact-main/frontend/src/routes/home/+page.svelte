<script lang="ts">
    import { onMount } from "svelte";
    import Navbar from "../../composents/Navbar.svelte";
    import ProductCard from "../../composents/ProductCard.svelte";
    import axios from "axios";
    import PopUp from "../../composents/PopUp.svelte";

    // Define the URL based on the environment
    const isProduction = process.env.NODE_ENV === 'production';
    console.log('isProduction: ', isProduction);
    let url = 'http://127.0.0.1:8000/';
    if (isProduction) {
        url = "https://django-openfoodfact.onrender.com/";
    }

    type ProductProps = {
        name: string,
        imgURL: string,
        description: string,
        id: string
    };

    let isOpen = false;

    // Initialiser les valeurs par défaut
    let categorieTargeted = "viande";
    let nuriscoreTargeted = "a";
    let searchId = "";

    let searchTerm = "";
    let listProduct: ProductProps[] = [];
    let filteredProducts: ProductProps[] = [];

    const nutriscoreMap: { [key: string]: string } = {
        'a': 'a',
        'b': 'a',
        'c': 'a|b',
        'd': 'a|b|c',
        'e': 'a|b|c|d',
        'unknown': 'a|b|c|d|e'
    };

    const changeNuriscore = (event: Event) => {
        nuriscoreTargeted = (<HTMLSelectElement>event.target).value.toLowerCase();
    };

    const changeCategories = (event: Event) => {
        categorieTargeted = (<HTMLSelectElement>event.target).value;
    };

    const filterProducts = (event: Event) => {
        searchTerm = (<HTMLInputElement>event.target).value.toLowerCase();

        filteredProducts = listProduct.filter(product => {
            let productName = product.name.toLowerCase();
            return productName.includes(searchTerm);
        });
        if (filteredProducts.length === 0 && (<HTMLInputElement>event.target).value.length === 0) return listProduct;
        return filteredProducts;
    };

    const searchProduct = async () => {
        const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];
        try {
            const res = await axios.get(`${url}api/product-search/?categories_tags_fr=${categorieTargeted}&nutrition_grades_tags=${nutriscoreMap[nuriscoreTargeted]}&page_size=20`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Token ${token}`
                    }
                }
            );
            if (res.status === 200) {
                console.log(res.data.products);
                const product: ProductProps[] = res.data.products.map((p: { product_name: string; image_front_url: string; code: string; }) => {
                    return {
                        name: p.product_name,
                        description: "",
                        imgURL: p.image_front_url,
                        id: p.code
                    };
                });
                listProduct = product;
                console.log(listProduct);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const chooseSubstitute = async (substituteCode: string) => {
        const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];
        try {
            const res = await axios.post(`${url}api/update-substitute/`, 
                {
                    search_id: searchId,
                    substitute_code: substituteCode
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Token ${token}`
                    }
                }
            );
            if (res.status === 200) {
                console.log("Substitute chosen successfully");
                window.location.href = "/account"; // Redirection vers la page /account
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Function to check if there are URL parameters for categories and nutrition grades
    const checkUrlParams = () => {
        const params = new URLSearchParams(window.location.search);
        const category = params.get('categories_tags_fr');
        const nutritionGrade = params.get('nutrition_grades_tags');
        searchId = params.get('id') || "";

        if (category) categorieTargeted = category;
        if (nutritionGrade) nuriscoreTargeted = nutritionGrade.toLowerCase();

        if (category || nutritionGrade) {
            searchProduct();
        }
    };

    // Call checkUrlParams on component mount
    onMount(() => {
        checkUrlParams();
    });
</script>

<Navbar>
    <button class="text-white" on:click={() => (isOpen = true)}> Scanner un produit </button>
</Navbar>
<div class="container mx-auto my-8"> <!-- Ajoutez ce conteneur -->
    {#if !searchId}
    <div class="bg-white shadow-md rounded-lg p-6 mb-4 mt-20">
        <div class="mb-4">
            <h1 class="text-xl font-semibold mb-2">
                Choisissez le produit à comparer
            </h1>
            <select on:change={changeCategories} class="w-full p-2 border border-gray-300 rounded-md" value={categorieTargeted}>
                <option value="viande">Viande</option>
                <option value="pates-a-tartiner">Pates à tartiner</option>
                <option value="confiture">Confiture</option>
                <option value="chocolat">Chocolat</option>
                <option value="fruits">Fruits</option>
                <option value="legumes">Légumes</option>
                <option value="produits-laitiers">Produits laitiers</option>
                <option value="cereales">Céréales</option>
                <option value="poisson">Poisson</option>
                <option value="boissons">Boissons</option>
                <option value="snacks">Snacks</option>
                <option value="epices">Épices</option>
                
            </select>
        </div>
        <div class="mb-4">
            <h1 class="text-xl font-semibold mb-2">
                Choisissez le nutriscore voulu
            </h1>
            <select on:change={changeNuriscore} class="w-full p-2 border border-gray-300 rounded-md" value={nuriscoreTargeted.toUpperCase()}>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
            </select>
        </div>
        <button on:click={searchProduct} class="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
            Rechercher
        </button>
    </div>
    <div class="mb-4">
        <h1 class="text-xl font-semibold mb-2">
            Cherchez un produit
        </h1>
        <input bind:value={searchTerm} type="text" on:input={filterProducts} class="w-full p-2 border border-gray-300 rounded-md"/>
    </div>

    <PopUp
        bind:isOpen
    />
    {/if}

    {#if listProduct.length > 0}
        {#if searchTerm.length > 0}
            {#if filteredProducts.length > 0}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {#each filteredProducts as fproduct}
                        <div>
                            <ProductCard
                                nameProduct={fproduct.name}
                                imgProduct={fproduct.imgURL}
                                codeProduct={fproduct.id}
                            >
                                {#if searchId}
                                    <button on:click={() => chooseSubstitute(fproduct.id)} class="bg-green-500 text-white px-2 py-1 rounded mt-2">Choisir ce substitut</button>
                                {/if}
                            </ProductCard>
                        </div>
                    {/each}
                </div>
            {:else}
                <p>Aucune donnée ne correspond à votre recherche</p>
            {/if}
        {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each listProduct as product}
                    <div>
                        <ProductCard
                            nameProduct={product.name}
                            imgProduct={product.imgURL}
                            codeProduct={product.id}
                        >
                            {#if searchId}
                                <button on:click={() => chooseSubstitute(product.id)} class="bg-green-500 text-white px-2 py-1 rounded mt-2">Choisir ce substitut</button>
                            {/if}
                        </ProductCard>
                    </div>
                {/each}
            </div>
        {/if}
    {:else}
        <p>Aucune données à affichés</p>
    {/if}
</div> <!-- Fermez ce conteneur -->

<style>
    .container {
        max-width: 70%; /* Limitez la largeur à 70% */
        margin-left: auto;
        margin-right: auto;
    }
</style>
