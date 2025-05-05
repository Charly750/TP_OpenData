<script lang="ts">
	import axios from "axios";

    // Define the URL based on the environment
    const isProduction = process.env.NODE_ENV === 'production';
    console.log('isProduction: ', isProduction);
    let url = 'http://127.0.0.1:8000/';
    if (isProduction) {
        url = "https://django-openfoodfact.onrender.com/";
    }


    let path: string = "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3"
    let isVisiblePassword : boolean = false

    let email: string | null = null
    let password: string | null = null
    
    const visiblePassword  = () => {
        console.log(isVisiblePassword)
        isVisiblePassword ? path = "M12 6.5a9.77 9.77 0 0 1 8.82 5.5c-1.65 3.37-5.02 5.5-8.82 5.5S4.83 15.37 3.18 12A9.77 9.77 0 0 1 12 6.5m0-2C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5m0 5a2.5 2.5 0 0 1 0 5a2.5 2.5 0 0 1 0-5m0-2c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5s4.5-2.02 4.5-4.5s-2.02-4.5-4.5-4.5" : path = "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3"
        isVisiblePassword = !isVisiblePassword
    }

    const connexion = async(event: Event) =>{
        event.preventDefault()
        try {
            const response = await axios.post(`${url}api-token-auth/`, {
                email: email,
                password: password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
                
            });
            if(response.status === 200){
                document.cookie = `token=${response.data.token}`
                window.location.href = "/home"
            }
            
        } catch (error) {
            console.error(error);

        }
        
    }

    const setEmail = (event: Event) => {
        email = (<HTMLInputElement>event.target).value
    }

    const setPassword = (event: Event) => {
        password = (<HTMLInputElement>event.target).value
    }

</script>

<div class="flex justify-center bg-white w-96 h-auto rounded-xl p-14">
    <div class="mt-4">
        <form method="POST">
            <div class="flex flex-col mb-4">
                <label for="email" class="mb-2">
                    Adresse mail
                </label>
                <input class="bg-slate-400 opacity-80 rounded-md mb-4 p-2" name="email" on:keyup={setEmail} />
                <label for="password" class="mb-2">
                    Mot de passe
                </label>
                <div class="relative">
                    <input class="bg-slate-400 opacity-80 rounded-md p-2 pr-8 w-full" type={isVisiblePassword ? "text" : "password"} name="password" on:keyup={setPassword} />
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer" on:click={visiblePassword} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path fill="currentColor" d={path}/>
                    </svg>
                </div>
            </div>
            <div class="mb-3">
                <button class="bg-slate-300 pr-5 pl-5 pt-2 pb-2 rounded-xl border-2 " type="submit" on:click={connexion}>
                    Connexion
                </button>
            </div>
        </form>
        <div>
            Pas encore de compte ? 
            <a href="/register" class="underline">
                Inscrivez-vous !
            </a>
        </div>
    </div>
</div>
