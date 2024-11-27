# Tutorial UPOS — Update Partial Object in Socket

## Sumario

- [Introdução](#introdução)
- [Instalação](#instalação)
- [Lado do servidor](#servidor)
- [Lado do cliente](#cliente)

## Introdução

---

## Instalação

---

```shell
npm i upos
```

## Servidor

---

## Cliente

---

### Instanciando objeto

Exemplo em typeScript

```typescript
import {SocketInstance, ObjectInSocket} from 'upos/client';

const url = '';
//Conecta-se ao servidor do socket
SocketInstance.createSocketInstance(url);

let user: any = {
    name: '',
    email: '',
}
//Instancia seu objeto no lado do servidor
ObjectInSocket.boot({
    id: 1,
    name: 'user',
    instance: user,
})
    //captura o novo objeto
    .then((data) => {
        //Agora seu objeto será atualizado apenas pelo servidor
        user = data;
    })
```

Outros exemplos em:
- [Vue](#exemplo-em-vue)
- [React](#exemplo-em-react)
- [Angular](#exemplo-em-angular)
- [SvelteKit](#exemplo-em-sveltekit)

#### Exemplo em Vue

Primeiro No arquivo main.js ou main.ts Conecte o cliente ao servidor

Forma simples:

```typescript
import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import type { Socket } from 'socket.io-client';
import { SocketInstance } from 'upos/client';

const app = createApp(App);

const url = '';
//Conectando ao servidor do socket
SocketInstance.createSocketInstance(url);

app.use(createPinia());
app.use(router);

app.mount('#app');
```
Capturando a instancia da conexão com o servidor:
```typescript
import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import type { Socket } from 'socket.io-client';
import { SocketInstance } from 'upos/client';

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $socket: Socket;
    }
}

const app = createApp(App);

const url = '';
//Conectando ao servidor do socket
app.config.globalProperties.$socket = SocketInstance.createSocketInstance(url);


app.use(createPinia());
app.use(router);

app.mount('#app');
```

Para instanciar um Objeto utilizando OPTIONS API

```vue
<template>
  <pre>{{user}}</pre>
</template>

<script lang="ts">
  import {ObjectInSocket} from 'upos/client';

  export default {
    name: 'HomeView',

    data() {
      return {
        user: {
          name: '',
          email: '',
        }
      }
    },

    mounted() {
      ObjectInSocket.boot({
        id: 1,
        name: 'user',
        instance: this.user
      })
          .then(data => {
            this.user = data;
          })
    }
  }
</script>
```

Para Instanciar um Objeto utilizando COMPOSITION API

```vue
<template>
  <pre>{{user}}</pre>
</template>

<script lang="ts" setup>
import {ObjectInSocket} from 'upos/client';
import { onMounted, ref } from 'vue'

const user = ref({
  name: '',
  email: ''
});

onMounted(async () => {
  await ObjectInSocket.boot({
    id: 1,
    name: 'user',
    instance: user.value
  })
    .then(data => {
      user.value = data;
    })
})
</script>
```

#### Exemplo em React

Obs.: Essa biblioteca não funciona no NextJs

Primeiro conecte-se ao servidor do socket, abrindo o arquivo main.jsx ou main.tsx

```tsx
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {SocketInstance} from "upos/client";

const url = '';
SocketInstance.createSocketInstance(url);

createRoot(document.getElementById('root')!).render(
    <App />,
)
```

Agora em qualquer component:

```tsx
import {useEffect, useState} from 'react';
import './App.css';
import {ObjectInSocket} from "upos/client";

function App() {
    const [user, setUser] = useState({
        name: '',
        email: '',
    });
    useEffect(() => {
        ObjectInSocket.boot({
            id: 1,
            name: 'user',
            instance: user
        })
            .then(data => {
                setUser(data);
            })
    });

  return (
    <>
      <div>{user.name}</div>
    </>
  )
}

export default App

```

#### Exemplo em Angular

Primeiro vá no arquivo main.ts:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { SocketInstance } from 'upos/client';

const url = '';
SocketInstance.createSocketInstance(url);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
```
Agora em qualquer component:

```typescript
import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ObjectInSocket} from 'upos/client';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  user = {
    name: '',
    email: ''
  };

  ngOnInit() {
    ObjectInSocket.boot({
      id: 1,
      name: 'user',
      instance: this.user,
    })
      .then((data) => {
        this.user = data;
      });
  }
}

```

#### Exemplo em SvelteKit

Primeiro passo, desativar o ssr da rota que será utlizado o component, dessa forma no arquivo +page.server.ts:
```typescript
export const ssr = false;
```

Agora no +page.svelte:

```sveltehtml
<script lang="ts">
    import {onMount} from "svelte";
    import {ObjectInSocket, SocketInstance} from 'upos/client';

    let user = $state({
        name: '',
        email: '',
        age: ''
    });

    onMount(async () => {
        const url = '';
        SocketInstance.createSocketInstance(url);
        await ObjectInSocket.boot({
            id: 1,
            name: 'user',
            instance: user,
        })
            .then(data => {
                user = data;
            });
    });
</script>

<pre>{JSON.stringify(user)}</pre>
```