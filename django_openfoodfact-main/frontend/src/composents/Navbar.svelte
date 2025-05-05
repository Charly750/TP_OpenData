<script lang="ts">
  import { onMount } from "svelte";
	import PopUp from "./PopUp.svelte";

  let isAuthenticated = false;

  // Function to check if the user is authenticated
  const checkAuth = () => {
      const cookies = document.cookie.split('; ');
      // const token = cookies.find(row => row.startsWith('token='));
      const token = document.cookie
                                    .split("; ")
                                    .find((row) => row.startsWith("token="))
                                    ?.split("=")[1];
      if (token) {
          isAuthenticated = true;
      }
  };

  // Call checkAuth on component mount
  onMount(() => {
      checkAuth();
  });

  // const searchProduct = (event: Event) => {
  //     // Logic for searching a product
  // };

  const logout = () => {
      // Clear the cookie and redirect to login
      document.cookie = 'token=; Max-Age=-99999999;';
      window.location.href = "/";
  };
</script>

<nav class="bg-gray-800 p-4">
  <div class="container mx-auto flex justify-between">
    <div class="flex items-center space-x-4">
       <slot/>
      </div>
      <div class="flex space-x-4 ml-auto">
        <a href="/home" class="text-white">Rechercher un produit</a>
          <a href="/account" class="text-white">Mon compte</a>
          {#if isAuthenticated}
              <button on:click={logout} class="text-white">Se déconnecter</button>
          {/if}
      </div>
  </div>
</nav>


<style>
  nav {
      background-color: #1a202c; /* Correspond à bg-gray-800 de Tailwind */
  }
</style>