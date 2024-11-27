# Tutorial UPOS — Update Partial Object in Socket

## Sumario

- [Introdução](#introdução)
- [Instalação](#instalação)
- [uso Básico](#uso-básico)
  - [Lado do servidor](#servidor)
  - [Lado do cliente](#cliente)
- [Uso Avançado](#uso-avançado)

## Introdução

---

Você já tentou atualizar um objeto utilizando socket ? Da muito trabalho não é mesmo ?
A solução mais otimizada é você atualizar atributo por atributo desse mesmo objeto, mas isso é um inferno, porque perdemos muito tempo escrevendo linhas de codigo repetidas vezes, com o UPOS não haverá mais esse problema!

### Como funciona ?

O UPOS, ele instancia seu objeto criado no lado do cliente no servidor do socket, e como isso funciona ? Basicamente pegamos seu objeto e registramos ele no servidor, agora tanto o cliente quanto o servidor conhecem o mesmo objeto, e com a solução do upos, sempre que você tentar atualizar um atributo desse objeto, apenas o valor atual desse atributo será enviado pela rede.
E o objeto só será atualizado no lado do cliente, apenas e unicamente quando o receber a atualização do servidor, garantindo assim que todos os clientes sempre tenham o mesmo objeto atualizado.

No UPOS é utilizado um esquema, onde que para instanciar um objeto é necessário passar uma id e um nome para esse objeto e só depois o proprio objeto, garantindo assim uma identificação completa do mesmo, então cada cliente que tiver com o mesmo id e nome, sempre receberá esse objeto, garantindo que não haverá conflitos entre objetos do mesmo tipo, e evitando tbm objetos com a mesma id e de tipos diferentes!


## Instalação

---

```shell
npm i upos
```

# Uso Básico

## Servidor

---

Após a instalação do upos, você já terá acesso a biblioteca e a versão indica do socket.io utilizados.

### Apos instalar o upos, instale:
```shell
npm i typescript @types/node ts-node
```
### execute:
```shell
npx tsc --init
```
Agora é necessário criar um arquivo chamado main.ts, e escrever:

```typescript
import { Server, Socket } from 'socket.io';
import {CacheSystem, UpdatePartialObject} from 'upos/server';

const io = new Server({
    cors: {
        origin: '*',
    },
});

const cacheSystem = new CacheSystem(1000);
const updatePartialObject = new UpdatePartialObject(io, cacheSystem);

io.on('connection', (socket: Socket) => {
    updatePartialObject.createInstances(socket);
});

io.listen(3000);
console.log('started!');
```

Note, que existe um cacheSystem, esse sistema de cache limite o uso de memoria do upos, se você não passar o cacheSystem, o valor default é 1000MB, recomendo que adicione um limite baseado nas suas demandas e/ou capacidades do seu servidor, o upos tem esse limite de memoria, pos os objetos que são registrado, são salvos dentro da memoria, para maximar o desempenho do servidor!
Caso tente ser registrado um objeto que va ultrapassar o limite de memoria, os objetos mais antigos serão apagados até liberar espaço suficiente para o novo objeto!

e para Executar esse codigo:

```shell
npx ts-node main.ts
```

Pronto, agora o lado do servidor já está com a configuração base

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

Note que ao chamarmos a função boot da class ObjectInSocket, temos que passar uma id e um name, onde esse name sempre será o tipo do objeto, assim você poderá ter varios objetos do mesmo tipo e com id's diferentes, caso algum outro cliente tente registrar um novo objeto com id e name ja registrados no servidor, o servidor apenas enviará os dados mais rescentes desse objeto.

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

# Uso Avançado

