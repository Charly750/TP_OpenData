<script lang="ts">
    export let nameProduct: string, imgProduct: string, codeProduct: string;
</script>

<div class="bg-white shadow-lg rounded-lg overflow-hidden mt-10">
    <div class="flex items-start p-4">
        <div class="w-36 h-36 flex-shrink-0 overflow-hidden">
            <a href={`https://fr.openfoodfacts.org/produit/${codeProduct}`} target="_blank">
                <img src={imgProduct} alt={nameProduct} class="w-full h-full object-cover">
            </a>
        </div>
        <div class="ml-4 flex-grow">
            {#if nameProduct}
                <a href={`https://fr.openfoodfacts.org/produit/${codeProduct}`} target="_blank" class="text-gray-600 mb-2">
                    <p>{nameProduct}</p>
                </a>
            {:else}
                <p class="text-gray-600 mb-2">Aucune description trouvée</p>
            {/if}
            <slot></slot> <!-- Permet d'insérer du contenu dynamique ici -->
        </div>
    </div>
</div>

