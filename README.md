# Clusters com Node.js

Resultado de um estudo comparando o cluster Node.js para distribuir cargas de trabalho entre seus processos de aplicativos.

Uma instância do Node.js é executada em um único thread, o que significa que em um sistema multi-core (que a maioria dos computadores são atualmente), nem todos os núcleos serão utilizados pelo aplicativo. Para aproveitar os outros núcleos disponíveis, você pode iniciar um cluster de processos Node.js e distribuir a carga entre eles.

O [módulo Cluster](https://nodejs.org/api/cluster.html) Node.js permite a criação de processos filhos (workers) que são executados simultaneamente e compartilham a mesma porta do servidor. Cada filho gerado tem seu próprio loop de eventos, memória e instância V8. Os processos filho usam IPC (comunicação entre processos) para se comunicar com o processo pai Node.js.

Bifurcar um processo é caro e lento, significa executar uma nova máquina virtual do zero e usar muita memória, já que os processos não compartilham memória.

## Instalação

Espera-se que possua o Node.js na versão v16.15.0 e o Yarn

Instale as dependências

```
yarn install
```

## Passo a passo

Experimente simular a concorrência de requisições simulando a solicitação de uma carga de trabalho custosa.

### Servidor que usa um único processo

Inicie o servidor.

```
yarn start-single
```

No seu navegador abra duas novas abas.

*  A primeira aba: executará uma rota comum de hello world
    * [http://localhost:3001](http://localhost:3001)
*  A segunda aba: executará uma rota de processamento custoso
    * [http://localhost:3001/api/v1/intense/5000000000](http://localhost:3001/api/v1/intense/5000000000)

Perceba que enquanto você executa a segunda rota, a primeira rota não é entregue até que a segunda seja concluída.

### Servidor que usa múltiplos processos

Inicie o servidor.

```
yarn start-multi
```

No seu navegador abra duas novas abas.

*  A primeira aba: executará uma rota comum de hello world
    * [http://localhost:3002](http://localhost:3002)
*  A segunda aba: executará uma rota de processamento custoso
    * [http://localhost:3002/api/v1/intense/5000000000](http://localhost:3002/api/v1/intense/5000000000)

Perceba que enquanto você executa a segunda rota, a primeira rota é entregue mesmo que a segunda não tenha sido concluída.

### Mais testes

Podemos simular testes mais complexos, por exemplo, executar a rota de processamento custoso com 1000 chamadas sendo 100 concorrentes.

Para testes mais complexos de estresse de carga podemos usar o [loadtest](https://www.npmjs.com/package/loadtest).

Para o servidor de único processo, simulando 1000 requisições sendo 100 em concorrência.

```
npx loadtest http://localhost:3001/api/v1/intense/5000000000 -n 1000 -c 100
```

> Lembre-se de iniciar o servidor antes. Pode demorar bastante, experimente diminuir o valor 5000000000.


Para o servidor de múltipos processos, simulando 1000 requisições sendo 100 em concorrência.

```
npx loadtest http://localhost:3002/api/v1/intense/5000000000 -n 1000 -c 100
```

> Lembre-se de iniciar o servidor antes. Pode demorar bastante, experimente diminuir o valor 5000000000.

Serão expostas métricas e será possível perceber que quanto mais tarefas, mais o multiplo processamento brilha, e quanto menos tarefas menos o multiplo processamento brilha.

O clustering brilha quando se trata de tarefas com uso intensivo de CPU. Quando é provável que o aplicativo execute essas tarefas, o clustering oferecerá uma vantagem em termos do número de tarefas que podem ser executadas por vez.

No entanto, se seu aplicativo não estiver executando muitas tarefas com uso intensivo de CPU, talvez não valha a pena gerar tantos trabalhadores. Lembre-se, cada processo que você cria tem sua própria memória e instância V8. Devido às alocações de recursos adicionais, gerar um grande número de processos filhos do Node.js nem sempre é recomendado.

## Gerenciando múltiplos processos de um melhor jeito

Nesse estudo, está sendo usado o cluster módulo Node.js para criar e gerenciar manualmente os processos de trabalho. Primeiro determina-se o número de trabalhadores a serem gerados (usando o número de núcleos de CPU), depois gera-se manualmente os trabalhadores e, finalmente, ouve-se quaisquer trabalhadores mortos para que se possa gerar novos.

Existe uma ferramenta que pode ajudar a gerenciar um pouco melhor o processo, o gerenciador de processos [PM2](https://pm2.keymetrics.io/). PM2 é um gerenciador de processos de produção para aplicativos Node.js com um balanceador de carga integrado. Quando configurado corretamente, o PM2 executará automaticamente seu aplicativo no modo de cluster, gerará trabalhadores para você e cuidará da geração de novos trabalhadores quando um trabalhador morrer. O PM2 facilita interromper, excluir e iniciar processos e também possui algumas ferramentas de monitoramento que podem ajudá-lo a monitorar e ajustar o desempenho do seu aplicativo.

Isso significa que ao executar o servidor de único processamento com o PM2, acaba-se conseguindo um resultado similar ao servidor de múltiplos processos, e isso sem necessitar implementar nada.

Experimente executar o PM2 nesse estudo, segue algums comandos:

```
npx pm2 [start|restart|reload|stop|delete] ecosystem.config.js

npx pm2 [logs|status|monit]
```

## Considerações

Esse estudo foi apenas para análise da bifurcação de processos em uma aplicação em Node.js, e entender um pouco de suas vantagens e desvantagens.

Esses artigos me inspiraram :] recomendo a leitura:

- [Artigo appsignal](https://blog.appsignal.com/2021/02/03/improving-node-application-performance-with-clustering.html)
- [Artigo wanago](https://wanago.io/2019/04/29/node-js-typescript-power-of-many-processes-cluster/)
- [Artigo dev.to](https://dev.to/karanpratapsingh/optimize-node-js-performance-with-clustering-kdg)

> Qualquer semelhança não é mera coincidência, usei alguns pontos desses artigos para explicar a motivação do estudo nesse README, me ajudou a fixar o propósito da implementação.

## License

[MIT licensed](LICENSE).
